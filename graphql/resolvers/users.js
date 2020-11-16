const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')

const { validateRegisterInput, validateLoginInput } = require('../../util/validators')
const { SECRET_KEY } = require('../../config')
const User = require('../../models/User')


function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        userName: user.userName
    }, SECRET_KEY, { expiresIn: '1h'})
}

module.exports = {
    Mutation: {
        async login(_, { userName, password }) {
            const {errors, valid }  = validateLoginInput(userName, password)

            if (!valid) {
                throw new UserInputError('Errors', { errors })
            }

            const user = await User.findOne({ userName })
            
            if (!user) {
                errors.general = 'User not found'
                throw new UserInputError('User not found', { errors })
            }

            const match = await bcrypt.compare(password, user.password)
            if (!match){
                errors.general = 'Password and username does not match'
                throw new UserInputError('Password and username does not match', { errors })
            }

            const token = generateToken(user)

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        async register(_, { registerInput : { userName, email, password, confirmPassword } }, ){
            // Validate date
            const { valid, errors } = validateRegisterInput(userName, email, password, confirmPassword)
            if (!valid) {
                throw new UserInputError('Errors', { errors })
            }
            // TODO: Make sure user does not already exist
            const user = await User.findOne({ userName })
            if (user) {
                throw new UserInputError('Username has already be taken', {
                    errors: {
                        userName: 'This username has already be taken'
                    }
                })
            }
            
            // Hash password and create an auth token
            password = await bcrypt.hash(password, 12)
            const newUser = new User({
                email,
                userName,
                password,
                createdAt: new Date().toISOString()
            })

            const res  = await newUser.save()
            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}