var uuid = require("uuid/v1");

async function DatabaseUsers()
{
    var connection = await require("mongodb").MongoClient;
    var conn = await connection.connect("mongodb://localhost:27017/", {useNewUrlParser : true});
    var db = await conn.db("ActivitiesTracker");
    const UserCollection = await db.collection("users");

    return UserCollection;
};


async function DatabaseEvents()
{
    var connection = await require("mongodb").MongoClient;
    var conn = await connection.connect("mongodb://localhost:27017/", {useNewUrlParser : true});
    var db = await conn.db("ActivitiesTracker");
    
    const EventCollection = await db.collection("events");
    EventCollection.createIndex({eventName: 1}, {collation: {locale: "en", strength: 2}});

    return EventCollection;
};


let obj1 = {
	eventImage:{fieldname:"eventImage", 
				originalname:"download.jpg", 
				encoding:"7bit", 
				mimetype:"image/jpeg", 
				destination:"./imageUploads/",
				filename:"download.jpg",
				path:"imageUploads\\download.jpg",
				size:"10930"},
    eventName: "Football game",
    eventDate:"2018-12-31",
    eventAddressLine1:"Jersey City",
    eventAddressLine2:"New Jersey",
    eventCity:"Jersey City",
    eventState:"New Jersey",
    eventZipCode:"07307",
    eventCountry:"USA",
    eventStartTime:"10:00 AM",
    eventEndTime:"12:00 PM",
    eventDescription:"Scoring goals or points by moving the ball to an opposing team's end of the field and either into a goal area, or over a line. Goals or points resulting from players putting the ball between two goalposts. The goal or line being defended by the opposing team.",
    eventTags:"Football",
    eventRequirements:["Club Tshirts", "track pants", "club t-shirts"],
    eventRegisterationLimit:"20",
	creatorPhone:"6465959426",
	creatorEmail:"n@gmail.com",
	registeredUsers:[],
	comments:[]
};

let obj2 = {
	eventImage:{fieldname:"eventImage", 
				originalname:"images.jpg", 
				encoding:"7bit", 
				mimetype:"image/jpeg", 
				destination:"./imageUploads/",
				filename:"images.jpg",
				path:"imageUploads\\images.jpg",
				size:"10930"},
    eventName: "Basketball game",
    eventDate:"2018-12-29",
    eventAddressLine1:"1 Castle point",
    eventAddressLine2:"Hoboken, New Jersey",
    eventCity:"Hoboken",
    eventState:"New Jersey",
    eventZipCode:"07030",
    eventCountry:"USA",
    eventStartTime:"10:00 AM",
    eventEndTime:"12:00 PM",
    eventDescription:"Scoring baskets or points by moving the ball to an opposing team's end of the field and either into a basket area, or over a line. Baskets or points resulting from players putting the ball in the baskets. The basket being defended by the opposing team.",
    eventTags:"Basketball",
    eventRequirements:["Club Tshirts", "track pants", "Basket ball"],
    eventRegisterationLimit:"20",
	creatorPhone:"6465959426",
	creatorEmail:"ssherkar@stevens.edu",
	registeredUsers:[],
	comments:[]
};




let obj3 = {
	usersname: "Nicholas Cacchione",
    userName:"nickcacchione",
    userEmail:"n@gmail.com",
    usersPhoneNumber:"1234568768",
    usersInterests:["football", "cricket"],
    usersAge:"21",
    usersSecurityQuestion:"Favorite color",
    usersSecurityAnswer:"Red",
    hashedPassword: "$2b$16$8o6ey1oF6s4lUq9mhYigte.yjBtR9egIwUgy33pfgWKx/LbxGf1M.", //1234
	rating:[5,4,3,4,5,2]
};

let obj4 = {
	usersname: "Shrikant Sherkar",
    userName:"smartshree",
    userEmail:"ssherkar@stevens.edu",
    usersPhoneNumber:"6465959426",
    usersInterests:["Swimming", "cricket"],
    usersAge:"26",
    usersSecurityQuestion:"Favorite color",
    usersSecurityAnswer:"Red",
    hashedPassword: "$2a$16$mA4JwbEsRxELO/CjoaYj1uKdDnzrT0CLQnG9OssseNIyfUwRmWw0C", //Stevens122897
	rating:[5,5,5,5,5,1]
};


async function addUser(signupObj)
{
	let dbUser = await DatabaseUsers();
	
	signupObj["_id"] = await uuid();
	
	let addedUser = await dbUser.insertOne(signupObj);
	
	await dbUser.createIndex({userEmail: 1}, {collation: {locale: "en", strength: 2}});
	await dbUser.createIndex({usersName: 1}, {collation: {locale: "en", strength: 2}});
	await dbUser.createIndex({userName: 1}, {collation: {locale: "en", strength: 2}});
	
	if(await addedUser)
	{
		return await addedUser;
	}
	else
	{
		return false;
	}
}; 


async function registerEvent(regEventObj)
{
	let dbEvent = await DatabaseEvents();
	
	regEventObj["_id"] = uuid();
	
	let regRes = await dbEvent.insertOne(regEventObj);
	//console.log(regEventObj);
	
	await dbEvent.createIndex({eventName: 1}, {collation: {locale: "en", strength: 2}});
    await dbEvent.createIndex({eventTags: 1}, {collation: {locale: "en", strength: 2}});
	
	return await regRes;
};

addUser(obj3);
addUser(obj4);

registerEvent(obj1);
registerEvent(obj2);
