
var express = require("express");
var app = express();
var request = require('request');
var Promise = require('bluebird')
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var baseURL = ;
var chatID = ;
var adminArr = [];
var timedPostMessage = "";

function getAdmins() {
    console.log("getting admins")
    adminArr = [];

    const getAdmins = {
        url: baseURL + '/getChatAdministrators?chat_id=' + chatID,
        method: 'GET'
    };

    request(getAdmins, function (err, res, body) {

        let json = JSON.parse(body);
        //console.log(json);

        for (let i = 0; i < json.result.length; i++) {
            adminArr.push(json.result[i].user.id);
        }
        console.log("recieved admin list")

    });

}

function doTimedPost() {

    const timedPost = {
        url: baseURL + '/sendMessage',
        method: 'GET',
        qs: {
            'chat_id': chatID,
            'parse_mode': "Markdown",
            'disable_web_page_preview': true,
            'disable_notification': true,
            'text': "Before you post, \n\u2705 Set a telegram profile photo \n\u2705 Please chat in English\n\u274c No third party advertising \n\u274c No spreading of fear, uncertainty and doubt \n\u274c No price discussion and speculation\n\u274c Do not post offensive images or posts \n\nBeware of scammers: our admins are @WindWG @ChuanYue\nAdmins will never ask you for token address, password or other crucial information!"
        }
    };

    request(timedPost, function (err, res, body) {
        console.log("sent timed post")
        let json = JSON.parse(body);
        console.log(json);
    });

}

app.get("/status", function (req, res) {
   res.send("Alive");
   console.log("alive");
    
});


app.post("/wegoldbot", function (req, res) {
    console.log("new update");
    console.log(req.body);

    res.sendStatus(200);

    let update = req.body;

    if (update.message.new_chat_member != null) {
        console.log("new member")

        const restrictUser = {
            url: baseURL + '/restrictChatMember?chat_id=' + chatID + '&&user_id=' + update.message.new_chat_member.id + '&&until_date=400' + '&&can_send_messages=true' + '&&can_send_media_messages=false' + '&&can_send_other_messages=false' + '&&can_add_web_page_previews=false',
            method: 'GET'
        };

        request(restrictUser, function (err, res, body) {
            console.log("restrict user")
            let json = JSON.parse(body);
            console.log(json);
        });



    };

    let isText = true;
    if (update.message.text == null) {
        console.log("not text message")
        isText = false;
    }

    let isUrl = true;
    if (update.message.entities == null) {
        console.log("not url")
        isUrl = false;
    }

    let isLeaving = true;
    if (update.message.left_chat_member == null) {
        console.log("not leaving message")
        isLeaving = false;
    }

    let isContact = true;
    if (update.message.contact == null) {
        console.log("not contact")
        isContact = false;
    }

    let isLocation = true;
    if (update.message.location == null) {
        console.log("not location")
        isLocation = false;
    }
    let isAdmin = false;
    if (adminArr.includes(update.message.from.id)) {
        console.log("admin posting")
        isAdmin = true
    }

    let isAddress = false;
    if(isText){
        let n = update.message.text.search(/0x.{40}/g);
        if(n>=0){
            isAddress = true;
        }
    }
   

    if (!isAdmin) {


        //delete message if text contains URL
        //delete message if contact is sent
        //delete message if location is sent
        //delete message if text contains ETH address
        if ((isText && isUrl) || isContact || isLocation ||(isText && isAddress)) {
            console.log(isText && isUrl)
            console.log(isContact)
            console.log(isLocation)
            console.log("bad content")


            const deleteMSG = {
                url: baseURL + '/deleteMessage?chat_id=' + chatID + '&&message_id=' + update.message.message_id,
                method: 'GET'
            };

            request(deleteMSG, function (err, res, body) {
                console.log("deleted message")
                let json = JSON.parse(body);
                console.log(json);

                const deleteResMSG = {
                    url: baseURL + '/sendMessage?chat_id=' + chatID + '&&text=' + "This type of content is not allowed @" + update.message.from.username,
                    method: 'GET'
                };

                request(deleteResMSG, function (err, res, body) {
                    console.log("sent warning")
                    let json = JSON.parse(body);
                    console.log(json);
                });
            })

        } else if (isLeaving) {


            const deleteMSG = {
                url: baseURL + '/deleteMessage?chat_id=' + chatID + '&&message_id=' + update.message.message_id,
                method: 'GET'
            };

            request(deleteMSG, function (err, res, body) {
                console.log("hide leaving member")
                let json = JSON.parse(body);
                console.log(json);
            })

        }



    }


});

console.log("getting adminlist for the first time")
getAdmins();
setInterval(getAdmins, 86400000);
setInterval(doTimedPost, 43200000);

app.listen(80, () => console.log('Server running on port 80'));
app.listen(443, () => console.log('Server running on port 443'));


/*
Webhook data
=============

/getChatAdministrators
{  
   "ok":true,
   "result":[  
      {  
         "user":{  
            "id":584717434,
            "is_bot":true,
            "first_name":"wegold_bot",
            "username":"wegold_bot"
         },
         "status":"administrator",
         "can_be_edited":false,
         "can_change_info":true,
         "can_delete_messages":true,
         "can_invite_users":true,
         "can_restrict_members":true,
         "can_pin_messages":true,
         "can_promote_members":false
      },
      {  
         "user":{  
            "id":46059369,
            "is_bot":false,
            "first_name":"Chuan Yue",
            "last_name":"Foo",
            "username":"Chuanyue"
         },
         "status":"administrator",
         "can_be_edited":false,
         "can_change_info":true,
         "can_delete_messages":true,
         "can_invite_users":true,
         "can_restrict_members":true,
         "can_pin_messages":true,
         "can_promote_members":false
      },
      {  
         "user":{  
            "id":41575796,
            "is_bot":false,
            "first_name":"yf",
            "username":"yfyfyfyfyfyf",
            "language_code":"en-US"
         },
         "status":"creator"
      }
   ]
}
=============

if user joins
    1. show welcome message
    2. restrict user
{  
    "update_id":823472418,
    "message":{  
       "message_id":197,
       "from":{  
          "id":532765944,
          "is_bot":false,
          "first_name":"Wind",
          "last_name":"WG",
          "username":"WindWG"
       },
       "chat":{  
          "id":-1001151871952,
          "title":"Wegold",
          "type":"supergroup"
       },

       //UTC timing
       "date":1523476207,
       "new_chat_participant":{  
          "id":532765944,
          "is_bot":false,
          "first_name":"Wind",
          "last_name":"WG",
          "username":"WindWG"
       },
       "new_chat_member":{  
          "id":532765944,
          "is_bot":false,
          "first_name":"Wind",
          "last_name":"WG",
          "username":"WindWG"
       },
       "new_chat_members":[  
          {  
             "id":532765944,
             "is_bot":false,
             "first_name":"Wind",
             "last_name":"WG",
             "username":"WindWG"
          }
       ]
    }
 }
 =============

  1. remove text if link
     {  
   "update_id":823472435,
   "message":{  
      "message_id":216,
      "from":{  
         "id":532765944,
         "is_bot":false,
         "first_name":"Wind",
         "last_name":"WG",
         "username":"WindWG"
      },
      "chat":{  
         "id":-1001151871952,
         "title":"Wegold admin group",
         "type":"supergroup"
      },
      "date":1523518107,
      "text":"A"
   }
},
{  
   "update_id":823472436,
   "message":{  
      "message_id":217,
      "from":{  
         "id":532765944,
         "is_bot":false,
         "first_name":"Wind",
         "last_name":"WG",
         "username":"WindWG"
      },
      "chat":{  
         "id":-1001151871952,
         "title":"Wegold admin group",
         "type":"supergroup"
      },
      "date":1523518110,
      "text":"Www.asd.com",
      "entities":[  
         {  
            "offset":0,
            "length":11,
            "type":"url"
         }
      ]
   }
},
{  
   "update_id":823472437,
   "message":{  
      "message_id":218,
      "from":{  
         "id":532765944,
         "is_bot":false,
         "first_name":"Wind",
         "last_name":"WG",
         "username":"WindWG"
      },
      "chat":{  
         "id":-1001151871952,
         "title":"Wegold admin group",
         "type":"supergroup"
      },
      "date":1523518126,
      "contact":{  
         "phone_number":"4*4",
         "first_name":"4*4"
      }
   }
},
{  
   "update_id":823472438,
   "message":{  
      "message_id":219,
      "from":{  
         "id":532765944,
         "is_bot":false,
         "first_name":"Wind",
         "last_name":"WG",
         "username":"WindWG"
      },
      "chat":{  
         "id":-1001151871952,
         "title":"Wegold admin group",
         "type":"supergroup"
      },
      "date":1523518135,
      "location":{  
         "latitude":20.659324,
         "longitude":-11.406255
      }
   }
}

    2. remove leave group
{  
   "update_id":823472442,
   "message":{  
      "message_id":224,
      "from":{  
         "id":532765944,
         "is_bot":false,
         "first_name":"Wind",
         "last_name":"WG",
         "username":"WindWG"
      },
      "chat":{  
         "id":-1001151871952,
         "title":"Wegold admin group",
         "type":"supergroup"
      },
      "date":1523519538,
      "left_chat_participant":{  
         "id":532765944,
         "is_bot":false,
         "first_name":"Wind",
         "last_name":"WG",
         "username":"WindWG"
      },
      "left_chat_member":{  
         "id":532765944,
         "is_bot":false,
         "first_name":"Wind",
         "last_name":"WG",
         "username":"WindWG"
      }
   }
}


*/

