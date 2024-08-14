"use strict";
const router = require("express").Router();
const { User, UserInformation } = require("../models");
const logger = require("../logger");
const Joi = require("joi");

function validateFields(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    color: Joi.string().valid("red", "green", "blue").required(),
    email: Joi.string().email().required(),
    dni: Joi.string().required(),
    lastName: Joi.string().required(),
    age: Joi.number().min(0).max(200).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return next();
}

function createUserInformation(req, res, next) {
  //Se crea en el model correspondiente con la informacion que viene por body
  UserInformation.create({
    dni: req.body.dni,
    lastName: req.body.lastName,
    name: req.body.name,
    age: req.body.age,
  })
    .then((userInfo) => {
      req.userInfo = userInfo;
      return next();
    })
    .catch((error) => {
      logger.error(
        `POST /users - createUserInformation error: ${error.message}`
      );
      return res.status(500).json({
        code: "internal_error",
        message: "Internal error",
      });
    });
}

function saveUser(req, res) {
  //Se crea en el model correspondiente con la informacion que viene por body

  return User.create({
    color: req.body.color,
    email: req.body.email,
    enable: req.body.enable,
    userInformation: req.userInfo._id,
  })
    .then((user) => {
      return res.status(200).json(user.toJSON());
    })
    .catch((error) => {
      logger.error(`POST /users - saveUser error: ${error.message}`);
      return res.status(500).json({
        code: "internal_error",
        message: "Internal error",
      });
    });
}

function getAllUsers(req, res) {
  //se extrae la query correspondiente, puede ser true o false
  const { enabled } = req.query;

  let query = User.find();
  //termina retornando o todos los usuarios si no tiene query la ruta o dependiendo la query
  if (enabled !== undefined) {
    const isEnabled = enabled === "true";
    query = query.where("enabled").equals(isEnabled);
  }

  query
    .then((users) => {
      return res.status(200).json(users);
    })
    .catch((error) => {
      logger.error(`GET /users - getAllUsers error: ${error.message}`);
      return res.status(500).json({
        code: "internal_error",
        message: "Internal error",
      });
    });
}
function getUserInformation(req, res) {
  //extraigo todos los elementos de la base de datos de la tabla UserInformation
  UserInformation.find()
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((error) => {
      logger.error(
        `GET /userInformation - getUserInformation error: ${error.message}`
      );
      return res.status(500).json({
        code: "internal_error",
        message: "Internal error",
      });
    });
}

function disableUser(req, res) {
  const userId = req.params.id; //EL ID DEL USUARIO QUE SE DESEA MODIFICAR

  User.findById(userId) //SE BUSCA EL ID EN LA TABLA
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.enabled) {
        return res.status(400).json({ error: "User is already disabled" });
      }
      user.enabled = false;
      return user.save();
    })
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((error) => {
      logger.error(
        `POST /users/${userId}/disable - disableUser error: ${error.message}`
      );
      return res.status(500).json({
        code: "internal_error",
        message: "Internal error",
      });
    });
}

async function updateUserInformation(req, res) {
  const { id } = req.params; //El id que viene por la ruta
  const updateData = req.body; // Los datos que se desean actualizar
  //Se busca por el id de la ruta, se le pasa los datos que se quieren modificar
  UserInformation.findByIdAndUpdate(id, updateData, { new: true })
    .then((updatedUserInformation) => {
      //Se maneja el error
      if (!updatedUserInformation) {
        return res.status(404).json({
          code: "not_found",
          message: "UserInformation not found",
        });
      }
      return res.status(200).json(updatedUserInformation);
    })
    .catch((error) => {
      logger.error(
        `PUT /userInformation/${id} - updateUserInformation error: ${error.message}`
      );
      return res.status(500).json({
        code: "internal_error",
        message: "Internal error",
      });
    });
}

// Rutas
router.post("/users", validateFields, createUserInformation, saveUser);
router.post("/users/:id/disable", disableUser);
router.get("/users", getAllUsers);
router.get("/userInformation", getUserInformation);
router.put("/userInformation/:id", updateUserInformation);

module.exports = router;
