// FRONT-END (CLIENT) JAVASCRIPT HERE

//Get the value of a set of radio buttons
function radioValue (name) {
  var elem = document.getElementsByName(name);
 
  for (let i = 0; i < elem.length; i++) {
      if (elem[i].checked){ return elem[i].value }
  }

  return null
}

//Submit a new item to server
const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const val1 = document.querySelector( "#firstVal" ), //First number (required)
        val2 = document.querySelector( "#secVal" ), //Second value (required)
        op = radioValue("operator"), //Operator (required)
        guess = document.querySelector( "#guess" ), //Answer guess (optional)
        json = { val1: val1.value, val2: val2.value, op: op, guess: guess.value},
        body = JSON.stringify( json )

  if (val1.value && val2.value && op) { //Check for requierd values
    const response = await fetch( "/submit", {
      method:"POST",
      body 
    })

    const resp = await response.json()
    displayData(resp) //Make the server table

    console.log( "text:", resp)
  }

}

//Delete an item
function deleteItem( event ) {
  let body = JSON.stringify(event.srcElement.id) //Send over the id (index) of the item to delete

  fetch( "/delete", {
    method:"POST",
    body 
  }).then( (response) => { //handle promises
      response.json().then((resp) => { //Handle other promise
        displayData(resp) //Display returned data
      })
    })

}

//Modify an item 
function modItem ( event ) {
  event.preventDefault() 

  //Hide the new item table
  let form = document.getElementsByClassName("forms")[0]
  form.style.display = "none"

  //Display the modification table
  let modform = document.getElementById("modForm")
  modform.style.display = "block"

  //Connect the save button to this item id
  let saveButton = document.getElementsByClassName("saveButton")[0]
  saveButton.id = event.srcElement.id
  saveButton.onclick = modSave
}

//Event function for the save button
async function modSave ( event ) {
  //Get same values (except guess) as new item. No items required
  const val1 = document.querySelector( "#newFirst" ),
        val2 = document.querySelector( "#newSec" ),
        op = radioValue("newOP"),
        answer = document.querySelector( "#forceAnswer" ),
        json = {index: event.srcElement.id, val1: val1.value, val2: val2.value, op: op, output: answer.value},
        body = JSON.stringify( json )

  const response = await fetch( "/modify", {
    method:"POST",
    body 
  })

  const resp = await response.json()
  displayData(resp)
  console.log( "text:", resp)
}

//Make sure to display the server data on first load
function initialLoad(){
  let body = null;

  fetch( "/refresh", {
    method:"POST",
    body
  }).then( (response) => {
      response.json().then((resp) => {
        displayData(resp)
      })
    }
  )
}

window.onload = function() {
  initialLoad();
  const subBtn = document.querySelector(".submitButton");
  subBtn.onclick = submit;
}

//Make a table to display server data
function displayData(data) {
  deleteTable() //Delete any pre-existing data

  //Make sure the modification form is not visible
  let modForm = document.getElementById("modForm")
  modForm.style.display = "none"

  //Make sure to display the new item form
  let form = document.getElementsByClassName("forms")[0]
  form.style.display = "block"

  let table = document.getElementById("serverTable") //Get the table
  for(let i = 0; i < data.length; i++){ //For every data item...
    if(document.getElementById("data" + i) == null) {
      let tr = document.createElement("tr") //New table row
      tr.id = "data" + i;
      tr.className = "dataTR"

      let tdID = document.createElement("td") //New column for data ID display
      tdID.innerHTML = i
      tdID.className = "entryID"
      tr.appendChild(tdID)
      for (let key in data[i]) {//For every data point in the row...
        let td = document.createElement("td") //New column
        let line = data[i]
        if(key == "guess" && line[key] != null) {//Some special display for guesses
          handleGuess(td, line[key])
        } else {
          td.innerHTML = line[key]
        }
        tr.appendChild(td)
      }

      //Make a delete button
      let deleteTd = makeButton("deleteButton", "Delete", i, deleteItem)
      tr.appendChild(deleteTd)

      //Make a modify button
      let modifyTd = makeButton("modButton", "Modify", i, modItem)
      tr.appendChild(modifyTd)

      table.appendChild(tr)
    }
  }
}

//Handle the display of a guess
function handleGuess (td, value) {
  if(value) { //If true, display correct instead of "true"
    td.innerHTML = "Correct"
    td.style.color = "green"
  } else { //If false, display "Incorrect" instead of "false"
    td.innerHTML = "Incorrect"
    td.style.color = "red"
  }
}

//Clear the table 
function deleteTable() {
  let table = document.getElementById("serverTable")
  //Loop through each element and remove from table
  table.querySelectorAll(".dataTR").forEach(elem => elem.remove())
}

//Make a button with specified params
function makeButton(className, inner, id, eventFunc) {
  //Create elements
  let buttonTd = document.createElement("td")
  let button = document.createElement("button")

  //Assign attributes 
  button.className = className
  button.id = id
  button.innerHTML = inner

  //Connect to button functions
  button.addEventListener("click", eventFunc)

  buttonTd.appendChild(button)
  return buttonTd
}