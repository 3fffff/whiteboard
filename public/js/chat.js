var element = document.getElementsByClassName('floating-chat')[0]
var close=document.getElementById('closeChat')
var open=false
var exp=false
//console.log(element)

close.addEventListener("click",closeElement)
element.addEventListener("click",openElement);
document.getElementById('files').addEventListener('change', handleFileSelect, false);
document.getElementById('sendMessage').addEventListener('click', sendNewMessage, false);

function openElement() {
    var chat=document.getElementsByClassName("chat")[0]
    if(open===false && exp===false) {
        element.className += ' expand';
        chat.className += " enter"
        open=true
        exp=true
    }
    exp=false
}

function closeElement() {
    element.className='floating-chat enter';
    var chat=document.getElementsByClassName("chat")[0]
    chat.className="chat"
    open=false
    exp=true
}

function readThenSendFile(data){

    var reader = new FileReader();
    reader.onload = function(evt){
        var msg ={};
        var img=["image/png","image/jpeg","image/gif"]
        msg.username = "user";
        msg.file = evt.target.result;
        msg.fileName = data.name;
        msg.type=data.type
        rtSocket.socket.emit('base64 file', msg);
        var image=0
        var messagesContainer = document.getElementsByClassName('messages')[0];
        for(var i=0;i<img.length;i++) {
            if(data.type===img[i]) {
                image=1
                messagesContainer.innerHTML+= '<li class="self">'+ '<img class="image_chat" width=150 height=150 src=' + evt.target.result + '>'+'</li>'
            }
        }
        if(image===0) {
          //  console.log("файл")
            messagesContainer.innerHTML+= '<li class="self">'+ '<a href=' + evt.target.result + '>'+data.name+'</a>'+'</li>'
        }
    };
    reader.readAsDataURL(data);
}

function handleFileSelect(evt) {
    var files = evt.target.files[0];
   // console.log(files)
    readThenSendFile(files)
}

function sendNewMessage() {
    var userInput = document.getElementsByClassName('text-box')[0];
    var newMessage = userInput.innerHTML.replace(/\<div\>|\<br.*?\>/ig, '\n').replace(/\<\/div\>/g, '').trim().replace(/\n/g, '<br>');

    if (!newMessage) return;

    var messagesContainer = document.getElementsByClassName('messages')[0];

    rtSocket.socket.emit('createMessage', {
        from: 'User',
        text: newMessage
    });

    messagesContainer.innerHTML+='<li class="self">'+newMessage+ '</li>'

    userInput.innerHTML='';
}