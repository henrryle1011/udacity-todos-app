import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

// Initialize DynamoDB client with X-Ray integration
const dynamoDB = new DynamoDB()
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDB)
const dynamodbClient = DynamoDBDocument.from(dynamoDbXRay)

const todosTable = process.env.TODOS_TABLE
const todosByUserIndexTable = process.env.TODOS_BY_USER_INDEX

// Get all todos for a user
const getTodos = async (userId) => {
  try {
    const result = await dynamodbClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :i',
      ExpressionAttributeValues: {
        ':i': userId
      },
      ScanIndexForward: false, // Sort in descending order
    })
    console.log('getTodos result:', result)
    return result.Items || [] // Return empty array if no items are found
  } catch (error) {
    console.error('Error getting todos:', error)
    throw new Error('Failed to get todos')
  }
}

// Create a new todo
const createTodo = async (item) => {
  try {
    await dynamodbClient.put({
      TableName: todosTable,
      Item: item
    })
    console.log('createTodo result:', item)
    return item
  } catch (error) {
    console.error('Error creating todo:', error)
    throw new Error('Failed to create todo')
  }
}

// Check if a todo with the same name already exists for the user
const checkHasExistedTodo = async (userId, name) => {
  try {
    const result = await dynamodbClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :i',
      FilterExpression: 'name = :name',
      ExpressionAttributeValues: {
        ':i': userId,
        ':name': name
      },
      ScanIndexForward: false, // Sort in descending order
    })

    console.log('checkHasExistedTodo result:', result)
    return result.Items && result.Items.length > 0 // Check if item exists
  } catch (error) {
    console.error('Error checking todo existence:', error)
    throw new Error('Failed to check todo existence')
  }
}

// Update an existing todo
const updateTodo = async (userId, todoId, item) => {
  try {
    await dynamodbClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': item.name,
        ':dueDate': item.dueDate,
        ':done': item.done
      }
    })
    console.log('updateTodo result:', { userId, todoId, item })
  } catch (error) {
    console.error('Error updating todo:', error)
    throw new Error('Failed to update todo')
  }
}

// Delete a todo
const deleteTodo = async (userId, todoId) => {
  try {
    await dynamodbClient.delete({
      TableName: todosTable,
      Key: { userId, todoId }
    })
    console.log('deleteTodo result:', { userId, todoId })
  } catch (error) {
    console.error('Error deleting todo:', error)
    throw new Error('Failed to delete todo')
  }
}

// Update the attachment URL for a todo
const updateTodoImage = async (userId, todoId, uploadUrl) => {
  try {
    await dynamodbClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': uploadUrl
      }
    })
    console.log('updateTodoImage result:', { userId, todoId, uploadUrl })
  } catch (error) {
    console.error('Error updating todo image:', error)
    throw new Error('Failed to update todo image')
  }
}

export {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateTodoImage,
  checkHasExistedTodo
}
