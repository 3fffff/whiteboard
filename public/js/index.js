document.getElementById("find_name").addEventListener("change",()=>{
    console.log("поиск")
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
            console.log("body" + body.toString())
        })
})