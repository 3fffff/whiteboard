var element = document.getElementsByClassName('floating-chat')[0]
var close=document.getElementById('closeChat')
var open=false
var exp=false

close.addEventListener("click",closeElement)
element.addEventListener("click",openElement);
document.getElementById('files').addEventListener('change', (e)=>{
    readThenSendFile(e.target.files[0])
}, false);
document.getElementById('sendMessage').addEventListener('click', sendNewMessage, false);

function openElement() {
    var chat=document.getElementsByClassName("chat")[0]
    if(open===false && exp===false) {
        element.className += ' expand';
        chat.className += " enter"
        document.getElementById("chat_img").style.display="none"
        open=true
        exp=true
    }
    exp=false
}

function closeElement() {
    element.className='floating-chat enter';
    var chat=document.getElementsByClassName("chat")[0]
    chat.className="chat"
    document.getElementById("chat_img").style.display="block"
    open=false
    exp=true
}

function readThenSendFile(data){
    var reader = new FileReader();
    reader.onload = function(evt){
        var msg ={};
        msg.username = "user";
        msg.file = evt.target.result;
        msg.fileName = data.name;
        msg.type=data.type
        tools.socket.emit('base64 file', msg);
        var type=data.type.split("/")
        var messagesContainer = document.getElementsByClassName('messages')[0];
        if(type[0]==="image")
            messagesContainer.innerHTML+= '<li class="self">'+'<img class="image_chat" width=150 height=150 src=' + evt.target.result + '>'+'</li>'
        else messagesContainer.innerHTML+= '<li class="self">'+ '<a download href=' + evt.target.result + '>'+data.name+'</a>'+ '</li>'
        sessionStorage.setItem("messages",messagesContainer.innerHTML)
    };
    reader.readAsDataURL(data);
}

function sendNewMessage() {
    var userInput = document.getElementsByClassName('text-box')[0];
    var newMessage = userInput.innerHTML.replace(/\<div\>|\<br.*?\>/ig, '\n').replace(/\<\/div\>/g, '').trim().replace(/\n/g, '<br>');
    if (!newMessage) return;
    var messagesContainer = document.getElementsByClassName('messages')[0];

    tools.socket.emit('createMessage', {
        from: 'User',
        text: newMessage
    });
    messagesContainer.innerHTML+='<li class="self">'+newMessage+ '</li>'
    userInput.innerHTML='';
}

document.getElementsByClassName("text-box")[0].addEventListener("keyup",(e) => {
    if (e.keyCode === 13)
        document.getElementById("sendMessage").click();
});