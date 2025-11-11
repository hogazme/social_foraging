import { response } from "express";

// Get interface elements
let adminParameters;
const stationCountInput = document.getElementById('stationCount');
const meanPriceInput = document.getElementById('meanPrice');
const playerBudgetInput = document.getElementById('playerBudget');
const downloadSpeedInput = document.getElementById('downloadSpeed');
const stationSizeInput = document.getElementById('stationSize');
const updateButton = document.getElementById('updateButton');
const resetButton = document.getElementById('reset-button');

const setInitialParameters = async () => {
    try {
        const response = await fetch('/admin-parameters');
        adminParameters = await response.json();
    } catch (error) {
        console.error('there was an error getting parameters from server, using default values instead...', error);
        adminParameters = {
            "numberOfStations": 10,
            "meanPrices": 30,
            "playerBudget": 100,
            "downloadSpeed": 100,
            "stationSize": 15
        }
    } finally {
        stationCountInput.value = adminParameters.numberOfStations;
        meanPriceInput.value  = adminParameters.meanPrices;
        playerBudgetInput.value = adminParameters.playerBudget;
        downloadSpeedInput.value = adminParameters.downloadSpeed;
        stationSizeInput.value = adminParameters.stationSize;
        document.getElementById('stationCountValue').textContent = stationCountInput.value;
        document.getElementById('meanPriceValue').textContent = meanPriceInput.value;
        document.getElementById('playerBudgetValue').textContent = playerBudgetInput.value;
        document.getElementById('downloadSpeedValue').textContent = downloadSpeedInput.value;
        document.getElementById('stationSizeValue').textContent = stationSizeInput.value;
    }
};
setInitialParameters();

// Function to update values in the interface when moving sliders
stationCountInput.addEventListener('input', () => {
    document.getElementById('stationCountValue').textContent = stationCountInput.value;
});
meanPriceInput.addEventListener('input', () => {
    document.getElementById('meanPriceValue').textContent = meanPriceInput.value;
});
playerBudgetInput.addEventListener('input', () => {
    document.getElementById('playerBudgetValue').textContent = playerBudgetInput.value;
});
downloadSpeedInput.addEventListener('input', () => {
    document.getElementById('downloadSpeedValue').textContent = downloadSpeedInput.value;
});
stationSizeInput.addEventListener('input', () => {
    document.getElementById('stationSizeValue').textContent = stationSizeInput.value;
});

// Function to update parameters on the server
updateButton.addEventListener('click', () => {
    const stationCount = parseInt(stationCountInput.value, 10);
    const meanPrice = parseInt(meanPriceInput.value, 10);
    const playerBudget = parseInt(playerBudgetInput.value, 10);
    const downloadSpeed = parseInt(downloadSpeedInput.value, 10);
    const stationSize = parseInt(stationSizeInput.value, 10);

    // Validate that values are valid numbers
    if (
        stationCount < 1 || 
        meanPrice < 1 || 
        playerBudget < 1 || 
        downloadSpeed < 1 || 
        stationSize < 1
    ) {
        alert('Please enter valid values!');
        return;
    }

    // Create an object with parameters to send
    const parameters = {
        stationCount,
        meanPrice,
        playerBudget,
        downloadSpeed,
        stationSize
    };
    console.log(parameters);
    // Send data to server
    fetch('/admin-parameters', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
    })
    .then(response => response.json())
    .then(data => {
        if (response) {
            alert(data.message); // Show success message from server
        }
    })
    .catch(error => {
        console.error('Error updating parameters:', error);
        alert('There was an error updating the parameters.');
    });
});

// Connection to server using Socket.IO to receive real-time updates
const socket = io();

// Listen for game state updates emitted by the server
socket.on('gameStateUpdated', (data) => {
    console.log('Game state updated:', data);

    // Update visual elements with new game state data
    updateStations(data.stations);
    updatePlayerBudget(data.playerBudget);
    updateDownloadSpeed(data.downloadSpeed);
    updateStationSize(data.stationSize);
});

// Functions to update the visual interface
function updateStations(stations) {
    const map = document.getElementById('map');
    map.innerHTML = ''; // Clear current stations

    stations.forEach(station => {
        const stationElement = document.createElement('div');
        stationElement.className = 'station';
        stationElement.style.top = `${station.top}px`;
        stationElement.style.left = `${station.left}px`;
        map.appendChild(stationElement);
    });
}

function updatePlayerBudget(budget) {
    const budgetElement = document.getElementById('budget');
    budgetElement.textContent = `Budget: $${budget}`;
}

function updateDownloadSpeed(speed) {
    console.log(`Download speed updated to: ${speed}`);
    // Here you can implement logic to reflect the speed change
}

function updateStationSize(size) {
    console.log(`Station size updated to: ${size}`);
    // Here you can implement logic to reflect the station size change
}

resetButton.addEventListener('click', () => {
    carPositionX = 0; // Starting X position
    carPositionY = 235; // Starting Y position
    energy = 100; // Full energy level
    money = 100; // Restore budget

    // Update the car's position on the map
    const playerCar = document.getElementById(`car-${playerId}`);
    if (playerCar) {
        playerCar.style.left = carPositionX + "px";
        playerCar.style.top = carPositionY + "px";
    }

    // Update UI
    updateEnergyBar();
    updateMoneyIndicator();

    // Emit reset event to server
    socket.emit('resetPlayer', {
        positionX: carPositionX,
        positionY: carPositionY,
        energy: energy,
        money: money
    });
});
