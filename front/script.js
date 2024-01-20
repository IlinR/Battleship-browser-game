


document.addEventListener('DOMContentLoaded', () => {

    const playerGrid = document.querySelector('.grid-player')
    const enemyGrid = document.querySelector('.grid-enemy')
    const displayGrid = document.querySelector('#grid-display')
    const ships = document.querySelectorAll('.ship')
    const tablebtn = document.querySelector('#tablebtn')
    const tbl = document.querySelector('.container-tbl')
    const startButton = document.querySelector('#start')
    const flipButton = document.querySelector('#flip')
    const turnDisplay = document.querySelector('#turn')
    const table = document.querySelector('#tblid')
    const setupButtons = document.querySelector('.setup-buttons')
    const userSquares = []
    const enemySquares = []


    let isHorizontal = true
    let isGameOver = false
    let currentPlayer = 'user'
    const width = 10
    let playerNum = 0
    let ready = false
    let enemyReady = false
    let allShipsPlaced = false
    let shotFiredId = -1
    let hitCount = 0
    let enemyhitcount =0
 

  
    createBoard(playerGrid, userSquares)
    createBoard(enemyGrid, enemySquares)
  let goal = 0
    let shipArr = [null,1,1,2,1,0]
    for (let i=1;i<shipArr.length;i++)
      goal += shipArr[i]*i
    ships.forEach(ship => {
      if (!(shipArr[ship.id]==0))
        ship.innerHTML = shipArr[ship.id]
      else ship.parentElement.removeChild(ship)

    });
   
    const socket = io();
  

    
      socket.on('denied', () =>{
        alert("Sorry, the server is full")
        window.location.href="http://localhost:4000"
      })
  

      socket.on('player-index', num => {
        
          playerNum = Number(num)
          if(playerNum === 1) currentPlayer = "enemy"
            socket.emit('ready-check')
        
      })
  


      socket.on('enemy-ready', () => {
        enemyReady = true

        if (ready) {
          playGame()

        }
      })
  

      socket.on('ready-check', players => {
        players.forEach(p => {

          if(p) enemyReady = true
          
        })
      })
  

      socket.on('timeout', () => {
        turnDisplay.innerHTML = 'You have reached the 10 minute limit'
      })
  

      startButton.addEventListener('click', () => {
        if(allShipsPlaced) {playGame(); }
        else turnDisplay.innerHTML = "Please place all ships"
      })
  

      enemySquares.forEach(square => {
        square.addEventListener('click', () => {
          if(currentPlayer === 'user' && ready && enemyReady) {
            shotFiredId = square.id
            socket.emit('shot', shotFiredId)
          }
        })
      })
  

      socket.on('shot', id => {
        const square = userSquares[id]
        socket.emit('shot-reply', square.classList)
        enemyReveal(id)


        playGame()
      })
  

      socket.on('shot-reply', classList => {
        revealSquare(classList)
        playGame()
      })
  

    
  

  


    function createBoard(grid, squares) {
        for (let i = 0; i < width*width; i++) {
        const square = document.createElement('div')
        square.id = i
        grid.appendChild(square)
        squares.push(square)
        }
    }


    function rotate() {
      if (isHorizontal== true) {
        ships.forEach(ship => ship.style.transform= `rotate(90deg)`)
        isHorizontal=false
      }
      else{
        ships.forEach(ship => ship.style.transform= `rotate(0deg)`)
        isHorizontal=true
      }
        
    }
    flipButton.addEventListener('click', rotate)
  
    

    ships.forEach(ship => ship.addEventListener('dragstart', dragStart))

    userSquares.forEach(square => square.addEventListener('dragover', dragOver))

    userSquares.forEach(square => square.addEventListener('drop', dragDrop))

  

    let draggedShip


    function dragStart(e) {
      draggedShip = e.target
      draggedShipLength = this.childNodes.length

    }
  
    function dragOver(e) {
      e.preventDefault()
    }


  
    function dragDrop(e) {
      let shipSqueres = []
      const startid= Number(e.target.id)
      const shipid = Number(draggedShip.id)
      let a=startid+shipid-1
      let b
      if (isHorizontal){
        let isValid = ((startid+shipid-1)%width>=shipid-1 && startid+shipid <= width*width)
        if (isValid){
          for (let i = 0; i < shipid; i++) {
            shipSqueres.push(userSquares[startid+i]);
            
          }
          if (shipSqueres.every(square => !square.classList.contains("taken"))){
            shipSqueres.forEach(square => {square.classList.add("taken")})
            draggedShip.innerHTML -= 1 
            if (draggedShip.innerHTML == 0) {draggedShip.parentElement.removeChild(draggedShip)
              if (document.querySelector('.ship')==null) allShipsPlaced=true
            }
          }
        }
      }
      else if(!isHorizontal) {
        let isValid = (startid+(shipid-1)*width < width*width)
        if (isValid){
          for (let i = 0; i < shipid; i++) {
            shipSqueres.push(userSquares[startid+i*width]);
            
          }
          if (shipSqueres.every(square => !square.classList.contains("taken"))){
            shipSqueres.forEach(square => {square.classList.add("taken")})
            draggedShip.innerHTML -= 1 
            if (draggedShip.innerHTML == 0) {draggedShip.parentElement.removeChild(draggedShip)
              if (document.querySelector('.ship')==null) allShipsPlaced=true
          }}
        }  
      }
      
      
    }
  

  

    function playGame() {
      if(isGameOver) return
      if(!ready) {
        socket.emit('player-ready')
        ready = true
        socket.emit('game-started')
      }
  
      if(enemyReady) {
        if(currentPlayer === 'user') {
          turnDisplay.innerHTML = 'Your Turn'
        }
        if(currentPlayer === 'enemy') {
          turnDisplay.innerHTML = "Enemy's Turn"
        }
      }
    }
  

  
  
    function revealSquare(classList) {
      if (!Object.values(classList).includes('hit'))  {
        if (Object.values(classList).includes('taken')) {
          hitCount++ 
          enemySquares[shotFiredId].classList.add('hit')}
     
        else if (!Object.values(classList).includes('miss')){

          enemySquares[shotFiredId].classList.add('miss')
          currentPlayer = 'enemy'
        }
      }
      checkForWins()
      
      
    }

    function enemyReveal(squareid) {
      
      if (!userSquares[squareid].classList.contains('hit')){
        if (userSquares[squareid].classList.contains('taken')) {
            enemyhitcount++
            userSquares[squareid].classList.add('hit')
        }else if (!userSquares[squareid].classList.contains('miss')){
            userSquares[squareid].classList.add('miss')
            currentPlayer = 'user'
            turnDisplay.innerHTML = 'Your Turn'
        }
      } 
        checkForWins()
    }
      
    
  
    function checkForWins() {

      
  
      if ((hitCount) === goal) {
        turnDisplay.innerHTML = "YOU WIN"
        socket.emit('game-ended', playerNum)
        gameOver()
      }
      if (enemyhitcount === goal) {
        turnDisplay.innerHTML ='ENEMY WINS'
        gameOver()
      }
    }

    tablebtn.addEventListener('click', showTable)  
    
    function showTable(){
      socket.emit('get-data')
      let box=document.querySelector('#hidden-box')
      box.classList.toggle('hidden')
    }

    socket.on('send-data', res => {
        updateTable(res)
      })

    function updateTable(data){
      table.innerHTML=''
      data.forEach(row => {
        let trow = table.insertRow()
        trow.innerHTML ='<td class="table">' + row.gamenumber +
         '</td><td class="table">' + row.date.split('T')[0] + 
         '</td><td class="table">' + row.time + 
         '</td><td class="table">' + ((typeof row.timelength.minutes === 'undefined') ? '00' : row.timelength.minutes) +':'+ String(row.timelength.seconds+100).substring(1) + 
         '</td><td class="table">' + row.outcome + '</td>'
      })
    }


    function gameOver() {
      isGameOver = true
      enemyGrid.style.display = 'none'
      playerGrid.style.display = 'none'

      setupButtons.style.display = 'none'
      tbl.style.display = 'flex'
      
    }
  })
  
  
