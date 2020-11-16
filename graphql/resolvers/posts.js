const { AuthenticationError, UserInputError } = require('apollo-server')
const { argsToArgsConfig } = require('graphql/type/definition')

const Post = require('../../models/Post')
const checkAuth = require('../../util/check-auth')

module.exports = {
    Query: {
        async getPosts(){
            try{
                // -1, descending order
                const posts = await Post.find().sort({ createdAt: -1})
                return posts
            } catch(err) {
                throw new Error(err)
            }
        },
        async getPost(_, { postId }) {
            try{
                const post = await Post.findById(postId)
                if(post) {
                    return post
                } else {
                    throw new Error('Post not found')
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context){
            const user = checkAuth(context)
            
            if (body.trim() === "") {
                throw new Error ('Post body is empty')
            }

            const newPost = new Post({
                body,
                user: user.id,
                userName: user.userName,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save()

            return post
        },
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);
      
            try {
              const post = await Post.findById(postId)
              if (!post){
                throw new Error('Post not found')
              }
              // make sure only the writer can delete his/her post
              if (user.userName === post.userName) {
                await post.delete()
                return 'Post deleted successfully'
              } else {
                throw new AuthenticationError('Action not allowed')
              }
            } catch (err) {
                
              throw new Error(err);
              
            }
        },
        async likePost(_, { postId }, context) {
            const { userName } = checkAuth(context)

            const post = await Post.findById(postId)

            if (post){
                if (post.likes.find(like => like.userName === userName)){
                    // post already liked, unlike it
                    post.likes = post.likes.filter(like => like.userName !== userName)
                } else {
                    // not liked, like post
                    post.likes.push({
                        userName,
                        createdAt: new Date().toISOString
                    })
                }

                await post.save()
                return post
            } else {
                throw new UserInputError('Post not found')
            }
        }
    }
}