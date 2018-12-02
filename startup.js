const  data = require("./data")
const usersData = data.users
const eventsData = data.events

const Bin = {
    name: 'Bin',
     userName: 'bingui',
    password: 'binbin',
     email: 'bgui@gamial.com',
      phoneNumber: '12312321',
       interests: 'interest', 
       age: '18',
        securityQuestion: 'haha'
}


usersData.addNewUser(Bin.name, Bin.userName, Bin.password, Bin.email, Bin.phoneNumber, Bin.interests, Bin.age, Bin.securityQuestion)

let newDate = new Date(2018,12,12)


const swim = {
    name: 'swim',
     date: newDate,
      startTime: '9:00 am',
       endTime: '12:00 am',
        description: 'funny',
        tags: 'sport',
         requirements: 'no',
          place: 'SIT' ,
           limit: 'fun',
        admin: 'Bin',
         state: 'active'
}

eventsData.addNewEvent(swim.name, swim.date, swim.startTime, swim.endTime, swim.description , swim.tags, swim.requirements, swim.place, swim.limit, swim.admin, swim.state)