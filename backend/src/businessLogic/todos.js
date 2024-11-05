import { v4 as uuidv4 } from 'uuid'
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateTodoImage
} from '../dataLayer/todosAccess.js'
import { generateImageUrl } from '../fileStorage/attachmentUtils.mjs'

const getTodosAction = async (userId) => {
  const result = await getTodos(userId)
  return result
}

const createTodoAction = async (userId, item) => {
  const createdAt = new Date().toISOString()
  const newTodo = {
    ...item,
    userId,
    todoId: uuidv4(),
    createdAt
  }
  const result = await createTodo(newTodo)
  return result
}

const updateTodoAction = async (userId, todoId, item) => {
  await updateTodo(userId, todoId, item)
}

const deleteTodoAction = async (userId, todoId) => {
  await deleteTodo(userId, todoId)
}

const uploadImageAction = async (todoId, image) => {
  const imageId = uuidv4()

  // Generate the presigned URL for the image upload
  const { presignedUrl, imageUrl } = await generateImageUrl(imageId)

  // Assuming that the image data has fields like 'groupId', 'timestamp', etc.
  const newImage = {
    todoId,
    imageId,
    imageUrl,
    timestamp: new Date().toISOString() // Adding timestamp for when the image was uploaded
  }

  // Update the todo item with the image URL
  await updateTodoImage(todoId, newImage.imageUrl)

  return { presignedUrl, imageUrl } // Return the presigned URL and the image URL
}

const generateImageUrlAction = async (userId, todoId) => {
  const imageId = uuidv4()

  // Generate presigned URL and image URL
  const { presignedUrl, imageUrl } = await generateImageUrl(imageId)

  // Update the todo item with the generated image URL
  await updateTodoImage(userId, todoId, imageUrl)

  return presignedUrl // Return the presigned URL for image upload
}

export {
  getTodosAction,
  createTodoAction,
  updateTodoAction,
  deleteTodoAction,
  uploadImageAction,
  generateImageUrlAction
}
