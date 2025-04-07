// ==== Game Initialization and Canvas Setup ====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial sizing

// ==== Game State Management ====
const GAME_STATE = {
  TITLE_SCREEN: 0,
  PLAYING: 1,
  GAME_OVER: 2
};

let currentGameState = GAME_STATE.TITLE_SCREEN; // Start with title screen
let isGameOver = false;

// ==== Title Screen Images ====
const titleLogo = new Image();
titleLogo.src = 'logo.png'; // Replace with your actual logo image
// Fallback if image isn't available
let logoLoaded = false;
titleLogo.onload = () => {
  logoLoaded = true;
};

// ==== Title Screen Animation Variables ====
let titlePulse = 0;
const titlePulseSpeed = 0.03;
let menuSelection = 0;
const menuOptions = ['START GAME', 'CONTROLS', 'QUIT'];

// ==== Player Setup ====
const player = {
    x: 100,
    y: 100,
    angle: 0,
    speed: 2,
    health: 100,
    maxHealth: 100,
    tookDamageTimer: 0
};

// ==== Map Generation (Simple grid-based map) ====
const map = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,0,1],
  [1,0,0,0,1,0,0,1],
  [1,1,1,1,1,1,1,1]
];
const TILE_SIZE = 64;

// ==== Keyboard Input Handling ====
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  
  if (currentGameState === GAME_STATE.TITLE_SCREEN) {
    if (e.key === 'ArrowUp' || e.key === 'w') {
      menuSelection = (menuSelection - 1 + menuOptions.length) % menuOptions.length;
    } else if (e.key === 'ArrowDown' || e.key === 's') {
      menuSelection = (menuSelection + 1) % menuOptions.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      handleMenuSelection();
    }
  } else if (currentGameState === GAME_STATE.GAME_OVER) {
    if (e.key === 'Enter' || e.key === ' ') {
      restartGame();
    }
  }
});
document.addEventListener('keyup', e => keys[e.key] = false);

// ==== Menu Selection Handler ====
function handleMenuSelection() {
  switch (menuSelection) {
    case 0: // START GAME
      currentGameState = GAME_STATE.PLAYING;
      break;
    case 1: // OPTIONS (placeholder)
      // Toggle options menu here in future
      break;
    case 2: // QUIT (placeholder)
      // In a real game, you might want to confirm first
      break;
  }
}

// ==== Mouse Look and Pointer Lock ====
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
canvas.addEventListener('click', () => {
  if (currentGameState === GAME_STATE.TITLE_SCREEN) {
    // Start the game when clicking anywhere on title screen
    currentGameState = GAME_STATE.PLAYING;
  } else if (currentGameState === GAME_STATE.GAME_OVER) {
    restartGame();
  } else {
    // Handle shooting in normal gameplay
    bullets.push({
      x: player.x,
      y: player.y,
      angle: player.angle
    });
    
    // Request pointer lock during gameplay only
    canvas.requestPointerLock();
  }
});

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
    player.angle += e.movementX * 0.002; // adjust sensitivity here
  }
});

// ==== Enemy Types Registry ====
const enemyTypes = {
    basic: {
      name: 'basic',
      img: new Image(),
      damage: 10,
      health: 50
    },
    shooter: {
      name: 'shooter',
      img: new Image(),
      damage: 15,
      health: 70
    }
  };
  
enemyTypes.basic.img.src = 'test.png';
enemyTypes.shooter.img.src = 'test2.jpg';

// ==== Collision Detection ====
function isWall(x, y) {
  const mapX = Math.floor(x / TILE_SIZE);
  const mapY = Math.floor(y / TILE_SIZE);
  return map[mapY] && map[mapY][mapX] === 1;
}

// ==== Player Movement ====
function movePlayer() {
  let dx = Math.cos(player.angle) * player.speed;
  let dy = Math.sin(player.angle) * player.speed;
  if (keys['w']) {
    if (!isWall(player.x + dx, player.y)) player.x += dx;
    if (!isWall(player.x, player.y + dy)) player.y += dy;
  }
  if (keys['s']) {
    if (!isWall(player.x - dx, player.y)) player.x -= dx;
    if (!isWall(player.x, player.y - dy)) player.y -= dy;
  }
  if (keys['a']) {
    const strafeAngle = player.angle - Math.PI / 2;
    const dx = Math.cos(strafeAngle) * player.speed;
    const dy = Math.sin(strafeAngle) * player.speed;
    if (!isWall(player.x + dx, player.y)) player.x += dx;
    if (!isWall(player.x, player.y + dy)) player.y += dy;
  }
  if (keys['d']) {
    const strafeAngle = player.angle + Math.PI / 2;
    const dx = Math.cos(strafeAngle) * player.speed;
    const dy = Math.sin(strafeAngle) * player.speed;
    if (!isWall(player.x + dx, player.y)) player.x += dx;
    if (!isWall(player.x, player.y + dy)) player.y += dy;
  }
//   if (keys['a']) player.angle -= 0.05;
//   if (keys['d']) player.angle += 0.05;
}

// ==== Shooting Mechanic ====
let bullets = [];
function moveBullets() {
  bullets = bullets.map(b => {
    b.x += Math.cos(b.angle) * 5;
    b.y += Math.sin(b.angle) * 5;
    return b;
  }).filter(b => !isWall(b.x, b.y));
}

// ==== Enemy Generation ====
function spawnEnemy(tileX, tileY, type = 'basic') {
    if (map[tileY][tileX] === 0 && enemyTypes[type]) {
        return {
          x: tileX * TILE_SIZE + TILE_SIZE / 2,
          y: tileY * TILE_SIZE + TILE_SIZE / 2,
          alive: true,
          type: enemyTypes[type],
          health: enemyTypes[type].health, // can adjust this per type if you want
          path: []
        };
      }
      return null;
}
let enemies = [
    spawnEnemy(2, 1, 'basic'),
    spawnEnemy(5, 2, 'shooter')
  ].filter(e => e !== null);
  
// ==== Enemy Hit Detection ====
function checkHits() {
    for (let bullet of bullets) {
      for (let enemy of enemies) {
        if (enemy.alive) {
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          if (dx * dx + dy * dy < 20 * 20) {
            enemy.health -= 25; // bullet damage here
            if (enemy.health <= 0) {
              enemy.alive = false;
            }
          }
        }
      }
    }
  }
function getTile(x, y) {
    return {
      x: Math.floor(x / TILE_SIZE),
      y: Math.floor(y / TILE_SIZE)
    };
}

// ==== Game Stats ====
const stats = {
  kills: 0,
  update() {
    this.kills = enemies.filter(e => !e.alive).length;
  }
};

// ==== Draw Title Screen ====
function drawTitleScreen() {
  // Background with dark red gradient (Doom style)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#300');
  gradient.addColorStop(0.6, '#800');
  gradient.addColorStop(1, '#300');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw pentagram or other demonic symbol as background element
  drawPentagram();
  
  // Title logo or text
  ctx.save();
  ctx.shadowColor = '#f00';
  ctx.shadowBlur = 10 + Math.abs(Math.sin(titlePulse) * 5);
  
  if (logoLoaded) {
    // Draw the actual logo image
    const logoWidth = canvas.width * 0.7;
    const logoHeight = logoWidth * (titleLogo.height / titleLogo.width);
    ctx.drawImage(
      titleLogo, 
      (canvas.width - logoWidth) / 2, 
      canvas.height * 0.2,
      logoWidth,
      logoHeight
    );
  } else {
    // Fallback text-based logo
    ctx.font = 'bold 100px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f00';
    ctx.fillText('DOOM CLONE', canvas.width / 2, canvas.height * 0.3);
    
    // Add a subtitle
    ctx.font = 'bold 40px Impact, sans-serif';
    ctx.fillStyle = '#ff0';
    ctx.fillText('KILL THE CODE', canvas.width / 2, canvas.height * 0.4);
  }
  ctx.restore();
  
  // Menu options
  const menuY = canvas.height * 0.6;
  
  menuOptions.forEach((option, index) => {
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    
    // Selected item gets red text and larger size
    if (index === menuSelection) {
      ctx.font = 'bold 42px monospace';
      ctx.fillStyle = '#f00';
      
      // Arrow indicator
      const arrowPulse = Math.sin(titlePulse * 3) * 10;
      ctx.fillText('>', canvas.width / 2 - 150 - arrowPulse, menuY + index * 60);
      ctx.fillText('<', canvas.width / 2 + 150 + arrowPulse, menuY + index * 60);
    } else {
      ctx.fillStyle = '#aaa';
    }
    
    ctx.fillText(option, canvas.width / 2, menuY + index * 60);
  });
  
  // Footer text
  ctx.font = '16px monospace';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('© 2025 - Use arrow keys to navigate, Enter to select', canvas.width / 2, canvas.height - 30);
  
  // Update animation
  titlePulse += titlePulseSpeed;
}

// ==== Draw a Pentagram (Doom style) ====
function drawPentagram() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 3;
  const radius = canvas.height / 6;
  
  ctx.save();
  ctx.strokeStyle = 'rgba(100, 0, 0, 0.3)';
  ctx.lineWidth = 3;
  
  // Draw circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw pentagram
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    // Calculate point coordinates
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2; // Start from top point
    const nextVertex = (i * 2 + 2) % 5;
    const nextAngle = (nextVertex * 2 * Math.PI / 5) - Math.PI / 2;
    
    const startX = centerX + radius * Math.cos(angle);
    const startY = centerY + radius * Math.sin(angle);
    const endX = centerX + radius * Math.cos(nextAngle);
    const endY = centerY + radius * Math.sin(nextAngle);
    
    if (i === 0) {
      ctx.moveTo(startX, startY);
    }
    ctx.lineTo(endX, endY);
  }
  ctx.stroke();
  ctx.restore();
}

// ==== Rendering Engine (Placeholder for Doom-like visuals) ====
function render() {
    // Clear screen
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0,canvas.width, canvas.height);
  
    // === 3D Wall Rendering (Raycasting) ===
    let wallDistances = [];
    castRays(wallDistances);
    // === 3D Enemy Sprite Rendering ===
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
    
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        const angleToEnemy = Math.atan2(dy, dx);
        let relativeAngle = angleToEnemy - player.angle;
    
        if (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
        if (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    
        const FOV = Math.PI / 3;
        const HALF_FOV = FOV / 2;
        const VIEW_DISTANCE = (canvas.width / 2) / Math.tan(HALF_FOV);
    
        if (Math.abs(relativeAngle) < HALF_FOV) {
        const screenX =canvas.width / 2 + Math.tan(relativeAngle) * VIEW_DISTANCE;
        const columnIndex = Math.floor(screenX);
    
        if (columnIndex >= 0 && columnIndex < wallDistances.length && wallDistances[columnIndex] < distance) {
            continue; // wall in front
        }
    
        const spriteHeight = Math.min(canvas.height, 30000 / distance);
        const spriteWidth = spriteHeight * (enemy.type.img.width / enemy.type.img.height);
    
        ctx.drawImage(
            enemy.type.img,  // Use correct sprite
            screenX - spriteWidth / 2,
            canvas.height / 2 - spriteHeight / 2,
            spriteWidth,
            spriteHeight
        );
        }
    }
  
  
    // === 3D Bullet Rendering (Simple Sprite Projection) ===
    const FOV = Math.PI / 3;
    const HALF_FOV = FOV / 2;
    const VIEW_DISTANCE = (canvas.width / 2) / Math.tan(HALF_FOV);
  
    for (let bullet of bullets) {
      const dx = bullet.x - player.x;
      const dy = bullet.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      const angleToBullet = Math.atan2(dy, dx);
      let relativeAngle = angleToBullet - player.angle;
  
      if (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
      if (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
  
      if (Math.abs(relativeAngle) < HALF_FOV) {
        const bulletScreenX =canvas.width / 2 + Math.tan(relativeAngle) * VIEW_DISTANCE;
        const size = Math.max(2, 200 / distance);
  
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(bulletScreenX, canvas.height / 2, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  
    // === Mini-map (Top-Right Corner, Scaled and Background Box) ===
    const miniMapScale = 0.25;
    const miniMapOffsetX =canvas.width - map[0].length * TILE_SIZE * miniMapScale - 10;
    const miniMapOffsetY = 10;
  
    ctx.save();
    ctx.translate(miniMapOffsetX, miniMapOffsetY);
  
    // Draw semi-transparent background for minimap
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-5, -5, map[0].length * TILE_SIZE + 10, map.length * TILE_SIZE + 10);
  
    ctx.scale(miniMapScale, miniMapScale);
  
    // Draw map walls
    ctx.fillStyle = 'gray';
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === 1) {
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  
    // Draw player
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
    ctx.fill();
  
    // Draw bullets
    ctx.fillStyle = 'yellow';
    for (let b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  
    // Draw enemies
    for (let e of enemies) {
      ctx.fillStyle = e.alive ? 'red' : 'darkred';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  
    ctx.restore();
  
    // === HUD: Draw stats ===
    ctx.fillStyle = 'white';
    ctx.fillText(`Kills: ${stats.kills}`, 30, 20);
    if (player.tookDamageTimer > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${player.tookDamageTimer / 30})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // === Draw Health Bar (bottom of screen) ===
    const healthBarWidth = 300;
    const healthBarHeight = 30;
    const healthBarX = (canvas.width - healthBarWidth) / 2;
    const healthBarY = canvas.height - healthBarHeight - 10; // 10px padding from bottom
    // Draw the background of the health bar (empty)
    ctx.fillStyle = 'gray';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    // Draw the foreground of the health bar (filled based on current health)
    const healthPercentage = player.health / player.maxHealth;
    ctx.fillStyle = 'green';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    // Optionally, draw the health text on top of the bar
    ctx.fillStyle = 'white';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Health: ${Math.max(0, player.health)} / ${player.maxHealth}`, canvas.width / 2, healthBarY + healthBarHeight / 2 + 5);
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        ctx.fillStyle = 'red';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
        ctx.fillStyle = 'white';
        ctx.font = '24px sans-serif';
        ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 30);
    }
}

// ==== Enemy Path Finding ====
function findPath(start, goal) {
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
  
    const key = ({ x, y }) => `${x},${y}`;
    const neighbors = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 }   // right
    ];
  
    gScore.set(key(start), 0);
    fScore.set(key(start), heuristic(start, goal));
  
    while (openSet.length > 0) {
      openSet.sort((a, b) => fScore.get(key(a)) - fScore.get(key(b)));
      const current = openSet.shift();
      if (current.x === goal.x && current.y === goal.y) {
        return reconstructPath(cameFrom, current);
      }
  
      for (let offset of neighbors) {
        const neighbor = { x: current.x + offset.x, y: current.y + offset.y };
        if (map[neighbor.y]?.[neighbor.x] !== 0) continue;
  
        const tentativeG = gScore.get(key(current)) + 1;
        const neighborKey = key(neighbor);
  
        if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + heuristic(neighbor, goal));
          if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
  
    return []; // No path found
  }
  
  function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  
  function reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom.has(`${current.x},${current.y}`)) {
      current = cameFrom.get(`${current.x},${current.y}`);
      path.unshift(current);
    }
    return path;
}

// helper fucntion
function findNearestWalkableTile(center) {
    const directions = [
      { x: 0, y: 0 },     // current
      { x: 0, y: -1 },    // up
      { x: 0, y: 1 },     // down
      { x: -1, y: 0 },    // left
      { x: 1, y: 0 },     // right
      { x: -1, y: -1 },   // top-left
      { x: 1, y: -1 },    // top-right
      { x: -1, y: 1 },    // bottom-left
      { x: 1, y: 1 }      // bottom-right
    ];
  
    for (let dir of directions) {
      const tile = { x: center.x + dir.x, y: center.y + dir.y };
      if (map[tile.y]?.[tile.x] === 0) {
        return tile;
      }
    }
    return center; // fallback if surrounded
  }

function updateEnemies() {
    const playerTile = getTile(player.x, player.y);
    for (let enemy of enemies) {
      if (!enemy.alive) continue;
  
      const enemyTile = getTile(enemy.x, enemy.y);
  
      // === Safe & Smart Path Recalculation ===
      const needsNewPath =
        !enemy.path || enemy.path.length === 0 ||
        (enemy.path.length > 1 &&
         (enemyTile.x !== enemy.path[0].x || enemyTile.y !== enemy.path[0].y));
  
      const shouldUpdate = needsNewPath || Math.random() < 0.02;
  
      if (shouldUpdate) {
        const targetTile = findNearestWalkableTile(playerTile);
        const newPath = findPath(enemyTile, targetTile);
        enemy.path = newPath;
      }
  
      // === Move Along Path ===
      if (enemy.path && enemy.path.length > 1) {
        const nextTile = enemy.path[1];
        const targetX = nextTile.x * TILE_SIZE + TILE_SIZE / 2;
        const targetY = nextTile.y * TILE_SIZE + TILE_SIZE / 2;
  
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const dist = Math.hypot(dx, dy);
        const speed = 1.0;
  
        if (dist > 1) {
          enemy.x += (dx / dist) * speed;
          enemy.y += (dy / dist) * speed;
        }
      }
  
      // === Handle enemy reaching player ===
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      if (Math.hypot(dx, dy) < 20) {
        // Enemy has reached the player — do attack logic here
        // e.g., reduce health, play sound, etc.
        if (player.tookDamageTimer <= 0) {
            player.health -= 10;
            player.tookDamageTimer = 30; // cooldown frames
          }
      }
      
    }
    if (player.tookDamageTimer > 0) {
        player.tookDamageTimer--;
      }
  }

// Function to spawn enemies at random locations
function spawnEnemyAtRandomLocation() {
    // Randomly choose a tile
    const tileX = Math.floor(Math.random() * map[0].length);
    const tileY = Math.floor(Math.random() * map.length);
    
    // Check if it's a walkable tile
    if (map[tileY][tileX] === 0) {
      const enemyType = Math.random() > 0.5 ? 'basic' : 'shooter'; // Randomly select enemy type
      const newEnemy = spawnEnemy(tileX, tileY, enemyType);
      
      if (newEnemy) {
        enemies.push(newEnemy); // Add to enemies array
      }
    }
  }

setInterval(spawnEnemyAtRandomLocation, 500); 


function castRays(wallDistances) {
    const FOV = Math.PI / 3;
    const numRays =canvas.width;
    const stepAngle = FOV / numRays;
  
    for (let i = 0; i < numRays; i++) {
      const rayAngle = player.angle - FOV / 2 + stepAngle * i;
      let distance = 0;
      let hit = false;
      
      // Ray marching
      while (!hit && distance < 1000) {
        distance += 1;
        const rayX = player.x + Math.cos(rayAngle) * distance;
        const rayY = player.y + Math.sin(rayAngle) * distance;
        if (isWall(rayX, rayY)) {
          hit = true;
        }
      }
  
      // Fix fisheye distortion
      const correctedDist = distance * Math.cos(rayAngle - player.angle);
      const lineHeight = Math.min(canvas.height, TILE_SIZE * 200 / correctedDist);
      const color = `rgb(${255 - correctedDist}, ${255 - correctedDist}, ${255 - correctedDist})`;
  
      ctx.fillStyle = color;
      ctx.fillRect(i, canvas.height / 2 - lineHeight / 2, 1, lineHeight);
      wallDistances[i] = correctedDist;  // Store wall distance per column
    }
  }

// ==== Main Game Loop ====
function gameLoop() {
  if (currentGameState === GAME_STATE.TITLE_SCREEN) {
    drawTitleScreen();
  } else if (currentGameState === GAME_STATE.PLAYING) {
    if (!isGameOver) {
      movePlayer();
      moveBullets();
      updateEnemies();
      checkHits();
      stats.update();
      
      if (player.health <= 0 && !isGameOver) {
        isGameOver = true;
        currentGameState = GAME_STATE.GAME_OVER;
      }
    }
    render();
  } else if (currentGameState === GAME_STATE.GAME_OVER) {
    render(); // Keep rendering to show game over screen
  }
  
  requestAnimationFrame(gameLoop);
}

// ==== Restart Game Function ====
function restartGame() {
  player.x = 100;
  player.y = 100;
  player.angle = 0;
  player.health = player.maxHealth;
  player.tookDamageTimer = 0;
  bullets = [];
  enemies = [
    spawnEnemy(2, 1, 'basic'),
    spawnEnemy(5, 2, 'shooter')
  ].filter(e => e !== null);
  isGameOver = false;
  currentGameState = GAME_STATE.PLAYING;
}

// ==== Start the game ====
gameLoop();