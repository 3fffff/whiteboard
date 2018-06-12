document.getElementById("find_name").addEventListener("change",function(){
    console.log(this.value)
    fetch('/', {
        method: 'POST',
        body: JSON.stringify({
            name: this.value
        }),
        headers: {"Content-Type" : "application/json"}
    })
        .then((res)=> {
            return res.json()
        })
        .then((body)=>{
            var rooms=JSON.parse(body)
            var find=document.getElementById("find")
            find.innerHTML=""
            if(rooms["rooms"].length===0)
                find.innerHTML+="<h3>ничего не найдено</h3>"
            for(var i=0;i<rooms["rooms"].length;i++)
                find.innerHTML+="<a href=/w.html?"+rooms["rooms"][i]["room"]+">"+rooms["rooms"][i]["room"]+"</a> <br/>"
        })
})