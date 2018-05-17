const Joi = require('joi');
const globIntersects = require('./lib/glob-intersection');

class User {

  constructor(config) {
    let validation = Joi.validate(config, User.ConfigurationSchema);

    if (validation.error !== null) {
      console.error('');
      console.error(`User ${ config.username } has invalid configuration:`.red.bold);
      console.error(validation.error.message);
      console.error('');
      process.exit(1);
    }

    this.config = validation.value;
    this.debug = require('debug')(`elasticsearch-namespaces:user[${this.config.username}]`);
  }

  /**
   * Checkf if user can write to specified indices.
   * @param  {Array} indices Array of indices, incl. ES special
   *                         notations like '_all', '*' or
   *                         wildcards.
   * @return {Boolean}       True=can write, False=cannot write.
   */
  canWriteIndices(indices) {
    for (let index of indices) {
      let checkTarget = (index == '_all') ? '*' : index;
      let accessible = this._isEntityAccessible('indices', checkTarget);
      this.debug(`for index ${index}, accessible=${accessible}`);
      if (!accessible) return false;
    }
    return true;
  }

  _isEntityAccessible(entityName, checkTarget) {
    switch (this.config.api_restrictions.order) {
      case 'allow': {
        return this._decideAllowDenyForEntity(entityName, 'allow', checkTarget);
      }
      case 'deny': {
        return !this._decideAllowDenyForEntity(entityName, 'deny', checkTarget);
      }
      case 'allow,deny': {
        let allowDecision = this._decideAllowDenyForEntity(entityName, 'allow', checkTarget);
        let denyDecision = this._decideAllowDenyForEntity(entityName, 'deny', checkTarget);
        if (!denyDecision) {
          return false;
        } else {
          return allowDecision;
        }
      }
      case 'deny,allow': {
        let allowDecision = this._decideAllowDenyForEntity(entityName, 'allow', checkTarget);
        let denyDecision = this._decideAllowDenyForEntity(entityName, 'deny', checkTarget);
        if (allowDecision) {
          return true;
        } else {
          return !denyDecision;
        }
      }
    }
  }

  _decideAllowDenyForEntity(entityName, allowOrDeny, checkTarget) {
    const schema = this.config.api_restrictions[allowOrDeny];
    const configuredEntity = schema[entityName];

    if (configuredEntity === 'all') return true;
    if (configuredEntity === 'none') return false;

    if (configuredEntity == null) {
      throw new Error(`Entity ${ entityName } is not defined.`);
    };

    for (let configuredTarget of configuredEntity) {
      if (globIntersects(configuredTarget, checkTarget).isGood) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for passwords.
   * @param  {String} password
   * @return {Boolean}
   */
  authenticate(password) {
    // if password is null, return true

    // this might be needed when actual authentication is managed
    // by the upper layer, for example reverse proxy

    return this.config.password ? this.config.password === password : true;
  }

}

const _api_restr_allow_deny_schema = Joi.object().keys({
  indices: Joi.alternatives().try(
    Joi.string().only('all', 'none'),
    Joi.array().items(Joi.string()).optional().default([])
  )
}).optional();

User.ConfigurationSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  api_restrictions: Joi.object().keys({
    order: Joi.string().only('allow','deny','allow,deny','deny,allow').required(),
    allow: _api_restr_allow_deny_schema.default('none'),
    deny: _api_restr_allow_deny_schema.default('all')
  }).optional().default({
    order: 'allow,deny',
    allow: 'all',
    deny: 'none'
  })
});

exports = module.exports = User;