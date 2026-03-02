/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         description:
 *           type: string
 *
 *     Story:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         article:
 *           type: string
 *         img:
 *           type: string
 *         category:
 *           type: string
 *         ownerId:
 *           type: string
 *
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
<<<<<<< HEAD
 *
 *     RegisterUser:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *
 *     LoginUser:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *
 *     ResetPassword:
 *       type: object
 *       required: [token, password]
 *       properties:
 *         token:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *
 *     RequestResetEmail:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
=======
>>>>>>> 8b9aa3f (fix all routs)
 */
