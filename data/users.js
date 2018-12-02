const mongoCollections = require("../config/mongoCollections");
const Users = mongoCollections.Users;
const uuid = require("node-uuid");
const bcrypt = require("bcrypt");
const saltRounds = 16;
const Events = mongoCollections.Events;

const exportedMethods = {


    async getUserById(id){
        const usersCollection = await Users();
        const User = await usersCollection.findOne({ _id: id });
        if (!User) throw "User not found";
        return User;
    },

    async addNewUser(name, userName, password, email, phoneNumber, interests = null, age = null, securityQuestion ){

        const usersCollection = await Users();
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = {
            _id: uuid.v4(),
            name: name,
            userName: userName,
            hashedPassword: hashedPassword,
            email: email,
            phoneNumber: phoneNumber,
            rating: null,
            interests: interests,
            schedule: [],
            history: [],
            age: age,
            comments:[],
            securityQuestion: securityQuestion,
            eventsPosted: []

        }

        const newInsertInformation = await usersCollection.insertOne(newUser);
        const newId = newInsertInformation.insertedId;
        return await this.getUserById(newId);
    },

    async updateUser(id, newUserData){
        const usersCollection = await Users();
        const oldUserData = await this.getUserById(id);
        const updatedUser = {};

        if(newUserData.name){
            updatedUser.name = newUserData.name;
        }else updatedUser.name = oldUserData.name

        if(newUserData.userName){
            updatedUser.userName = newUserData.userName;
        }else updatedUser.userName = oldUserData.userName

        if(newUserData.password){
            const hashedPassword = await bcrypt.hash(newUserData.password, saltRounds);
            updatedUser.hashedPassword = hashedPassword;
        }else if(newUserData.hashedPassword){
            updatedUser.hashedPassword = newUserData.hashedPassword
        }
         else updatedUser.hashedPassword = oldUserData.hashedPassword

        if(newUserData.email){
            updatedUser.email = newUserData.email
        }else updatedUser.email = oldUserData.email

        if(newUserData.phoneNumber){
            updatedUser.phoneNumber = newUserData.phoneNumber
        }else updatedUser.phoneNumber = oldUserData.phoneNumber

        if(newUserData.rating){
            updatedUser.rating = newUserData.rating
        }else updatedUser.rating = oldUserData.rating

        if(newUserData.interests){
            updatedUser.interests = newUserData.interests
        }else updatedUser.interests = oldUserData.interests

        //sch history age comment
        if(newUserData.schedule){
            updatedUser.schedule = newUserData.schedule
        }else updatedUser.schedule = oldUserData.schedule

        if(newUserData.history){
            updatedUser.history = newUserData.history
        }else updatedUser.history = oldUserData.history

        if(newUserData.age){
            updatedUser.age = newUserData.age
        }else updatedUser.age = oldUserData.age

        if(newUserData.comments){
            updatedUser.comments = newUserData.comments
        }else updatedUser.comments = oldUserData.comments

        if(newUserData.securityQuestion){
            updatedUser.securityQuestion = newUserData.securityQuestion
        }else updatedUser.securityQuestion = oldUserData.securityQuestion

        if(newUserData.eventsPosted){
            updatedUser.eventsPosted = newUserData.eventsPosted
        }else updatedUser.eventsPosted = oldUserData.eventsPosted

        let updateCommand = {
            $set: updatedUser
          };
          const query = {
            _id: id
          };
          await usersCollection.updateOne(query, updateCommand);
      
          return await this.getUserById(id);
    }



}

module.exports = exportedMethods;