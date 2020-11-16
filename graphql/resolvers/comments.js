const { UserInputError, AuthenticationError } = require('apollo-server')

const checkAuth = require('../../util/check-auth')
const Post = require('../../models/Post')

module.exports = {
    Mutation: {
        createComment: async (_, {postId, body}, context) => {
            const { userName } = checkAuth(context)
            if (body.trim() === ''){
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment body is empty'
                    }
                })
            }

            const post = await Post.findById(postId)

            if (post){
                post.comments.unshift({
                    body,
                    userName,
                    createdAt: new Date().toISOString()
                })
                await post.save();
                return post
            } else {
                throw new UserInputError('Post not found')
            }
        },
        async deleteComment (_, { postId, commentId }, context ){
            const { userName } = checkAuth(context)
            
            const post = await Post.findById(postId)

            if(Post){
                const commentIndex = post.comments.findIndex(c => c.id === commentId)
                if (post.comments[commentIndex].userName === userName){
                    post.comments.splice(commentIndex, 1)
                    await post.save()
                    return post
                } else {
                    throw new AuthenticationError('Action not allowed')
                }

            } else {
                throw new UserInputError('Post now found')
            }
        }
    }
}