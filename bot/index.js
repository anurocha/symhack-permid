const fetch = require('node-fetch');
const Symphony = require('symphony-api-client-node');

const API_KEY = ''; // put API key here

class PermId {
  constructor(apiKey) {
      this.apiKey = apiKey;
  }

  async taggingSearch(text) {
    let searchUrl = `https://api.thomsonreuters.com/permid/calais`;
    let apiKey = this.apiKey;
    return fetch(searchUrl, {
        method: 'POST',
        headers: {
            'X-AG-Access-Token': this.apiKey,
            'Content-Type': 'text/raw',
            'outputformat': 'application/json'
        },
        body: text
    })
    .then(response => {
        return response.json()
    });
  }

  async getTaggingData(text) {
      let searchResult = await this.taggingSearch(text);
      let taggingResult = [];
      return new Promise(function(resolve, reject) {
          for(var key in searchResult) {
              var att = searchResult[key];
              if(att._typeGroup === 'entities' && att._type === 'Company') {
                let atName = att.name.replace(new RegExp(' ', 'g'), '');
                taggingResult.push(`<cash tag="${atName}"/>`);
                //taggingResult.push('$' + att.name);
                  //taggingResult.push('<span class="has-hover-cashtag msg-entity cashtag no-focus drop-target drop-abutted drop-abutted-left drop-element-attached-top drop-element-attached-left drop-target-attached-bottom drop-target-attached-left" data-value="$apple">$apple</span>');
              }
          }
          resolve(taggingResult);
      });
  }
}

let p = new PermId(API_KEY);
const botHearsSomething = ( event, messages ) => {
  console.log('from bot');
    messages.forEach( (message, index) => {
      //let reply_message = 'Hello ' + message.user.firstName + ', hope you are doing well!!'
      //Symphony.sendMessage( message.stream.streamId, reply_message, null, Symphony.MESSAGEML_FORMAT);
      p.getTaggingData(message.messageText)
      .then( res => {
        Symphony.sendMessage( message.stream.streamId, res.toString(), null, Symphony.MESSAGEML_FORMAT);
      });
    })
}

Symphony.initBot(__dirname + '/config.json')
  .then( (symAuth) => {
    console.log('hhh');
    Symphony.getDatafeedEventsService( botHearsSomething );
    Symphony.forwardMessage( botHearsSomething );
  })