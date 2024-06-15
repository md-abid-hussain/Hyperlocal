import { Router } from 'express'
import userController from '../controllers/userController'
import verifyJWT from '../middlewares/verifyJWT'

const router = Router()

router.route('/')
  .get(userController.getAllUser)
  .post(userController.createUser)
  .patch(verifyJWT,userController.updateUser)
  .delete(verifyJWT,userController.deleteUser)

router.route('/me')
  .get(verifyJWT,userController.getCurrentUser)

export default router
