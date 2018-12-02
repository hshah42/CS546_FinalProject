const mongoCollections = require("../config/mongoCollections");
const Events = mongoCollections.Events;
const uuid = require("node-uuid");
const bcrypt = require("bcrypt");
const saltRounds = 16;
const Users = mongoCollections.Users;

const exportedMethods = {

    async getEventById(id){
        const eventsCollection = await Events();
        const event = await eventsCollection.findOne({ _id: id });
        if (!event) throw "Event not found";
        return event;
    },
    async addNewEvent(name, date, startTime, endTime, description , tags, requirements, place, limit, admin, state){

        const eventsCollection = await Events();
        
        const newEvent = {
            _id: uuid.v4(),
            name: name,
            date: date,
            startTime: startTime,
            endTime: endTime,
            description: description,
            tags: tags,
            requirements: requirements,
            registeredUser:[],
            place: place,
            limit: limit,
            comments: [],
            waitlist:[],
            admin: admin,
            state: state,
            rating: null
        }

        const newInsertInformation = await eventsCollection.insertOne(newEvent);
        const newId = newInsertInformation.insertedId;
        return await this.getEventById(newId);
    },
    async updateEvent(id, newEvent){
        const eventsCollection = await Events();
        const oldEvent = await this.getEventById(id);
        const updatedEvent = {};

        if (newEvent.name) {
            updatedEvent.name = newEvent.name
          }else updatedEvent.name = oldEvent.name;
      
        if (newEvent.date) {
            updatedEvent.date = newEvent.date
          }else updatedEvent.date = oldEvent.date;

        if(newEvent.startTime){
            updatedEvent.startTime = newEvent.startTime;
        }else updatedEvent.startTime  = oldEvent.startTime;

        if(newEvent.endTime){
            updatedEvent.endTime = newEvent.endTime
        }else updatedEvent.endTime = oldEvent.endTime;

        if(newEvent.description){
            updatedEvent.description = newEvent.description;
        }else updatedEvent.description = oldEvent.description ;

        if(newEvent.tags){
            updatedEvent.tags = newEvent.tags;
        }else { updatedEvent.tags = oldEvent.tags};

        if(newEvent.requirements){
            updatedEvent.requirements = newEvent.requirements;
        }else { updatedEvent.requirements = oldEvent.requirements};

        if(newEvent.registeredUser){
            updatedEvent.registeredUser = newEvent.registeredUser;
        }else updatedEvent.registeredUser = oldEvent.registeredUser;

        if(newEvent.place){
            updatedEvent.place = newEvent.place;
        }else updatedEvent.place = oldEvent.place

        if(newEvent.limit){
            updatedEvent.limit = newEvent.limit
        }else updatedEvent.limit = oldEvent.limit;

        if(newEvent.comments){
            updatedEvent.comments = newEvent.comments;
        }else updatedEvent.comments = oldEvent.comments;

        if(newEvent.waitlist){
            updatedEvent.waitlist = newEvent.waitlist;
        }else updatedEvent.waitlist = oldEvent.waitlist;

        if(newEvent.admin){
            updatedEvent.admin = newEvent.admin
        }else updatedEvent.admin = oldEvent.admin

        if(newEvent.state){
            updatedEvent.state = newEvent.state;
        } else updatedEvent.state = oldEvent.state;
        
         if(newEvent.rating){
             updatedEvent.rating = newEvent.rating
         }else updatedEvent.rating = oldEvent.rating

        let updateCommand = {
            $set: updatedEvent
          };
          const query = {
            _id: id
          };
          await eventsCollection.updateOne(query, updateCommand);
      
          return await this.getEventById(id);
    }
}

module.exports = exportedMethods