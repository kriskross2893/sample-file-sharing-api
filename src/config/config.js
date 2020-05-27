
import dotenv from 'dotenv';
import joi from 'joi';
import debugLib from 'debug';

if (process.env.NODE_ENV == null) {
  const config = dotenv.config();

  if (config.error) {
    throw config.error;
  }
}

if (process.env.NODE_ENV !== 'test') {
  const envVarSchema = joi.object({
    NODE_ENV: joi.string()
      .valid(['development', 'production'])
      .required(),
    HOST: joi.string()
      .required()
      .default('0.0.0.0'),
    PORT: joi.number()
      .integer()
      .required()
      .default(5000),
    DEBUG: joi.string()
      .default('*'),
    FOLDER: joi.string()
      .required(),
  }).unknown()
    .required();

  const {error} = joi.validate(process.env, envVarSchema);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }
}

debugLib.enable(process.env.DEBUG);
