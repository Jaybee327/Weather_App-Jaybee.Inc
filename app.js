// Select elements
const days = document.querySelectorAll('.day');
const valueSearch = document.getElementById('search-input');
const cityElement = document.querySelector('.city-name-text');
const maindegree = document.querySelector('.temperature-value');
const humidity = document.querySelector('.humidity-value');
const dayTemperatures = document.querySelectorAll('.day-temperature');
const form = document.querySelector('.search-form');
const weatherIcon = document.querySelector('.weather-icon');
const dayIcons = document.querySelectorAll('.day-icon');

// API key and URL
const apiKey = 'be3bedc62f3caa49f0623dec3aa4e38f';
const baseUrl = 'https://api.openweathermap.org/data/2.5';

// autocomplete code
$(document).ready(function() {
    $("#search-input").autocomplete({
        source: function(request, response) {
            const cityListUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${request.term}&limit=10&appid=be3bedc62f3caa49f0623dec3aa4e38f`;
            $.ajax({
                url: cityListUrl,
                success: function(data) {
                    response($.map(data, function(item) {
                        return {
                            label: item.name + ", " + item.country,
                            value: item.name
                        };
                    }));
                }
            });
        },
        select: function(event, ui) {
        $(this).val(ui.item.value);
        getWeather(ui.item.value);
        getForecast(ui.item.value);
    }
    });
});

// Event listener for form submission
form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (valueSearch.value !== '') {
        getWeather(valueSearch.value);
        getForecast(valueSearch.value);
    }
});

// Function to get current weather for user's location
const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `${baseUrl}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            fetch(url)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
                    }
                })
                .then(data => {
                    cityElement.textContent = data.name;
                    maindegree.textContent = `${Math.round(data.main.temp)}°C`;
                    humidity.textContent = `Humidity: ${data.main.humidity}%`;
                    document.querySelector('.appSkin').classList.remove('sunny', 'rainy', 'cloudy');
                    const weatherId = data.weather[0].id;
                    if (weatherId >= 200 && weatherId < 300) { // Thunderstorm
                        document.querySelector('.appSkin').classList.add('rainy');
                    } else if (weatherId >= 300 && weatherId < 400) { // Drizzle
                        document.querySelector('.appSkin').classList.add('rainy');
                    } else if (weatherId >= 500 && weatherId < 600) { // Rain
                        document.querySelector('.appSkin').classList.add('rainy');
                    } else if (weatherId >= 800 && weatherId < 900) { // Clear or Clouds
                        if (weatherId === 800) { // Clear
                            document.querySelector('.appSkin').classList.add('sunny');
                        } else { // Clouds
                            document.querySelector('.appSkin').classList.add('cloudy');
                        }
                    }

                    // Update the weather icon
                    const now = new Date().getTime() / 1000;
                    let suffix = '';
                    if (now > data.sys.sunrise && now < data.sys.sunset) {
                      suffix = '-d';
                    } else {
                      suffix = '-n';
                    }
                    weatherIcon.className = `weather-icon owf owf-${weatherId}${suffix}`;
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            const forecastUrl = `${baseUrl}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            fetch(forecastUrl)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
                    }
                })
                .then(data => {
                    const forecastData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
                    forecastData.forEach((item, index) => {
                        dayTemperatures[index].textContent = `${Math.round(item.main.temp)}°C`;

                        // Update the forecast icons
                        const forecastIconCode = item.weather[0].id;
                        const forecastSuffix = item.dt > data.city.sunrise && item.dt < data.city.sunset ? '-d' : '-n';
                        dayIcons[index].className = `day-icon owf owf-${forecastIconCode}${forecastSuffix}`;
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }, error => {
            if (error.code === error.PERMISSION_DENIED) {
                setTimeout(getCurrentLocationWeather, 1000);
            } else {
                console.error('Error:', error);
                cityElement.textContent = 'Location access denied';
                maindegree.textContent = '';
                humidity.textContent = '';
            }
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        cityElement.textContent = 'Geolocation not supported';
        maindegree.textContent = '';
        humidity.textContent = '';
    }
};

getCurrentLocationWeather();

// Function to get weather for searched city
const getWeather = (city) => {
    const url = `${baseUrl}/weather?q=${city}&units=metric&appid=${apiKey}`;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
        })
        .then(data => {
            cityElement.textContent = data.name;
            maindegree.textContent = `${Math.round(data.main.temp)}°C`;
            humidity.textContent = `Humidity: ${data.main.humidity}%`;
            document.querySelector('.appSkin').classList.remove('sunny', 'rainy', 'cloudy');
            const weatherId = data.weather[0].id;
            if (weatherId >= 200 && weatherId < 300) { // Thunderstorm
                document.querySelector('.appSkin').classList.add('rainy');
            } else if (weatherId >= 300 && weatherId < 400) { // Drizzle
                document.querySelector('.appSkin').classList.add('rainy');
            } else if (weatherId >= 500 && weatherId < 600) { // Rain
                document.querySelector('.appSkin').classList.add('rainy');
            } else if (weatherId >= 800 && weatherId < 900) { // Clear or Clouds
                if (weatherId === 800) { // Clear
                    document.querySelector('.appSkin').classList.add('sunny');
                } else { // Clouds
                    document.querySelector('.appSkin').classList.add('cloudy');
                }
            }

            // Update the weather icon
            const now = new Date().getTime() / 1000;
            let suffix = '';
            if (now > data.sys.sunrise && now < data.sys.sunset) {
              suffix = '-d';
            } else {
              suffix = '-n';
            }
            weatherIcon.className = `weather-icon owf owf-${weatherId}${suffix}`;
        })
        .catch(error => {
            console.error('Error:', error);
            cityElement.textContent = 'Try a valid city';
            maindegree.textContent = '0';
            humidity.textContent = '0';
            document.querySelector('.weather-app').classList.add('shake');
            setTimeout(() => {
                document.querySelector('.weather-app').classList.remove('shake');
            }, 500);
        });
};

// Function to get forecast
const getForecast = (city) => {
    const url = `${baseUrl}/forecast?q=${city}&units=metric&appid=${apiKey}`;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
        })
        .then(data => {
            const forecastData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
            forecastData.forEach((item, index) => {
                dayTemperatures[index].textContent = `${Math.round(item.main.temp)}°C`;

                // Update the forecast icons
                const forecastIconCode = item.weather[0].id;
                const forecastSuffix = item.dt > data.city.sunrise && item.dt < data.city.sunset ? '-d' : '-n';
                dayIcons[index].className = `day-icon owf owf-${forecastIconCode}${forecastSuffix}`;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            dayTemperatures.forEach(temp => temp.textContent = '0');
        });
};

// Event listener for day buttons
days.forEach((day) => {
    day.addEventListener('click', () => {
        if (document.querySelector('.popup')) return;

        const popup = day.cloneNode(true);
        popup.classList.add('popup');

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.classList.add('close-button');
        popup.appendChild(closeButton);

        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay);

        closeButton.addEventListener('click', () => {
            popup.remove();
            overlay.remove();
        });

        document.body.appendChild(popup);
    });
});