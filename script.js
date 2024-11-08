function toggleMenu() {
    const menu = document.querySelector('#menu');
    menu.classList.toggle('active');
}
const signalConfig = document.getElementById('signal-config');
const liFunction = document.createElement('li');
const liAmplitude = document.createElement('li');
liAmplitude.innerHTML = `
        <div class="class-li">
            <label for="amplitude">Amplitud:</label>
            <span id="amplitudeValue">1</span>
        </div>
        <input type="range" name="amplitude" id="amplitude" min="1" max="10" step="0.5" value="1" 
               oninput="document.getElementById('amplitudeValue').innerText = this.value">`;
const liPeriod = document.createElement('li');
liPeriod.innerHTML = `
        <div class="class-li">
            <label for="period">Periodo T:</label>
            <span id="periodValue">3</span>
        </div>
        <input type="range" name="period" id="period" min="1" max="10" step="0.5" value="3" 
               oninput="document.getElementById('periodValue').innerText = this.value">`;
const liStart = document.createElement('li');
liStart.innerHTML = `
        <div class="class-li">
            <label for="start">Inicio del periodo:</label>
            <span id="startValue">0</span>
        </div>
        <input type="range" name="start" id="start" min="-10" max="10" step="0.5" value="0" 
               oninput="document.getElementById('startValue').innerText = this.value">`;

function createDOM(){
    signalConfig.innerHTML = ''
    signalConfig.appendChild(liPeriod);
    signalConfig.appendChild(liStart);
    signalConfig.appendChild(liAmplitude);
}

document.addEventListener("DOMContentLoaded", () => {
    const layoutFrequency = {
        title: 'Dominio de la Frecuencia',
        xaxis: { title: 'Frecuencia (Hz)' },
        yaxis: { title: 'Amplitud' },
    };

    Plotly.newPlot('frequencyChart', [{ x: [], y: [] }], layoutFrequency);

    const layoutWave = {
        title: 'Señal',
        xaxis: { title: 'Tiempo (s)' },
        yaxis: { title: 'Amplitud' },
    };

    Plotly.newPlot('signal', [{ x: [], y: [] }], layoutWave);

    const layoutTime = {
        title: 'Dominio del tiempo',
        xaxis: { title: 'Tiempo (s)' },
        yaxis: { title: 'Amplitud' },
    };

    Plotly.newPlot('timeChart', [{ x: [], y: [] }], layoutTime);
});

function updateForm() {
    const waveOption = document.getElementById('wave-options').value;
    const wave = document.getElementById('wave');
    if (waveOption === "cuadrada") {
        wave.innerHTML = `
            <select name="fourier-options" id="fourier-options">
                <option value="general">Elige una opción</option>
                <option value="trigonometrica">Trigonométrica</option>
                <option value="compleja">Compleja</option>
            </select>
        `;
    } else if (waveOption === "rectangular") {
        wave.innerHTML = `
            <select name="fourier-options" id="fourier-options">
                <option value="general">Elige una opción</option>
                <option value="compleja">Compleja</option>
            </select>
        `;
    } else if (waveOption === "pulso") {
        wave.innerHTML = `
            <select name="fourier-options" id="fourier-options">
                <option value="general">Elige una opción</option>
                <option value="transformada">Transformada</option>
            </select>
        `;
    }
    const fourierSelect = document.getElementById('fourier-options');
    if(fourierSelect){
        fourierSelect.addEventListener('change', addConfigWave);
    }
}


function addConfigWave() {
    const waveSelected = document.getElementById('wave-options').value
    const option = document.getElementById('fourier-options').value;
    const harmonics = document.createElement('li');
    harmonics.innerHTML = `
            <div class="class-li">
                <label for="harmonics">Cantidad de armónicas:</label>
                <span id="harmonicsValue">5</span>
            </div>
            <input type="range" name="harmonics" id="harmonics" min="1" max="10" step="1" value="5" 
                       oninput="document.getElementById('harmonicsValue').innerText = this.value">`
    const pulse = document.createElement('li')
        pulse.innerHTML = `
            <div class="class-li">
                    <label for="pulse">Pulso: </label>
                    <span id="pulseValue">1</span>
            </div>
                <input type="range" name="pulse" id="pulse" min="1" max="10" step="1" value="1" 
                       oninput="document.getElementById('pulseValue').innerText = this.value">`
    if (waveSelected === "cuadrada" && option === "trigonometrica") {
        createDOM()
        signalConfig.appendChild(harmonics);
    } else if (waveSelected === "rectangular" && option === "compleja") {
        createDOM()
        signalConfig.appendChild(pulse);
    } else if(waveSelected === "cuadrada" && option === "compleja"){
        createDOM()
    } else if(waveSelected === "pulso" && option === "transformada") {
        signalConfig.innerHTML = ''
        signalConfig.appendChild(pulse)
        signalConfig.appendChild(liStart)
        signalConfig.appendChild(liAmplitude)
    }
}

document.getElementById('signal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const waveOption = document.getElementById('wave-options').value;
    const A = parseFloat(document.getElementById('amplitude').value);
    
    const option = document.getElementById('fourier-options').value;

    if (waveOption === "cuadrada" && option === "trigonometrica") {
        liFunction.innerHTML = ``
        const start = parseFloat(document.getElementById('start').value);
        const T = parseFloat(document.getElementById('period').value);
        const N = parseInt(document.getElementById('harmonics').value);
        trigonometric(T, A, N, start);
    } else if (waveOption === "cuadrada" && option === "compleja") {
        document.getElementById('timeChart').innerHTML = ''
        const start = parseFloat(document.getElementById('start').value);
        const T = parseFloat(document.getElementById('period').value);
        complex(T, A, start);
    } else if(waveOption === "rectangular" && option === "compleja"){
        document.getElementById('timeChart').innerHTML = '';
        const start = parseFloat(document.getElementById('start').value);
        const p = parseFloat(document.getElementById('pulse').value);
        const T = parseFloat(document.getElementById('period').value);
        complexRectangular(T, A, start, p);
    } else if(waveOption === "pulso" && option === "transformada"){
        document.getElementById('timeChart').innerHTML = '';
        const p = parseFloat(document.getElementById('pulse').value);
        const start = parseFloat(document.getElementById('start').value);
        transformation(A, p, start)
    } else {
        console.error("Uno o más elementos no están presentes. Selecciona una opción válida y asegúrate de que los controles necesarios estén generados.");
    }
});

function trigonometric(T, A, N, start) {
    const time = [];
    const squareWave = [];
    const signal = [];
    
    let fourierSeries = `f(t) = `;
    // Construimos la expresión de la serie trigonometrica de fourier
    for (let n = 1; n <= N; n += 2) { // Solo armónicos impares
        // Calculamos el coeficiente en términos de π
        const coef = `4/${n}π`; // Mantener en términos de π
        // Calculamos la frecuencia y simplificamos la expresión
        const frequency = `(${n}π * t / ${T})`; // Simplificando la expresión de frecuencia
        // Armamos el término de la serie
        const term = `${coef} * sin(${frequency})`;
        fourierSeries += (n === 1 ? "" : " + ") + term;
    }
    liFunction.innerHTML = `
        <div class="class-li">
            <span>Serie trigonometrica: </span>
        </div>
        <span id="function">${fourierSeries}</span>`;
    signalConfig.appendChild(liFunction)

    // Recorrer `t` en un rango simétrico alrededor de `start`
    for (let t = start - 100 * T; t < start + 100 * T; t += 0.01) {
    // Ajustar `t` al inicio del periodo en `start`
    const adjustedTime = t - start;

    // Generar la señal cuadrada basándose en el valor ajustado de `t`
    const squareValue = ((adjustedTime % T + T) % T < T / 2) ? A : -A;
    squareWave.push(squareValue);
    
    // Cálculo de la serie de Fourier para aproximar la señal cuadrada
    let sum = 0;
    for (let n = 1; n <= N; n += 2) { // Solo armónicos impares
        sum += (4 * A / (Math.PI * n)) * Math.sin((2 * Math.PI * n * adjustedTime) / T);
    }

    time.push(t);
    signal.push(sum);
    }
    
    // Graficar la señal cuadrada
    Plotly.newPlot('signal', [{
        x: time,
        y: squareWave,
        mode: 'lines',
        name: 'Señal Cuadrada',
        line: { color: 'green' }
    }], {
        title: 'Señal Cuadrada',
        xaxis: { 
            title: 'Tiempo (s)',
            range: [-5, 5],  // Ajustar el rango para mostrar de -5 a 5
            autorange: false 
        },
        yaxis: { 
            title: 'Amplitud',
            range: [-A-0.5, A+0.5], 
            autorange: false 
        },
        dragmode: 'zoom' 
    });
    

    // Graficar la señal en el dominio del tiempo
    Plotly.newPlot('timeChart', [{
        x: time,
        y: signal,
        mode: 'lines',
        name: 'Señal Cuadrada (Transformación de Fourier)',
        line: { color: 'blue' }
    }], {
        title: 'Dominio del Tiempo - Señal Cuadrada',
        xaxis: { 
            title: 'Tiempo (s)',
            range: [-5, 5],  // Ajustar el rango para mostrar de -5 a 5
            autorange: false 
        },
        yaxis: { 
            title: 'Amplitud',
            range: [-A-1, A+1], 
            autorange: false 
        },
        dragmode: 'zoom' 
    });

    // Frecuencias y amplitudes
    const frequencies = [];
    const amplitudes = [];
    for (let n = 1; n <= N; n += 2) {
        frequencies.push(n / T);
        amplitudes.push((4 * A) / (Math.PI * n));
    }

    const layout = {
        title: 'Dominio de la Frecuencia',
        xaxis: { 
            title: 'Frecuencia (Hz)',
            range: [-0.5, 5],
            autorange: true 
        },
        yaxis: { 
            title: 'Amplitud',
            range: [-0.5, A+0.5],
            autorange: true 
        },
        dragmode: 'zoom',
        shapes: [] // Para agregar líneas
    };

    // Añadir líneas entre los puntos y el eje x
    for (let i = 0; i < frequencies.length; i++) {
        layout.shapes.push({
            type: 'line',
            x0: frequencies[i],
            y0: 0,
            x1: frequencies[i],
            y1: amplitudes[i],
            line: {
                color: 'rgba(75, 192, 192, 0.5)',
                width: 3
            }
        });
    }

    // Graficar solo las líneas
    Plotly.newPlot('frequencyChart', [], layout); 

    // Agregar las líneas a la gráfica después de crearla
    Plotly.addTraces('frequencyChart', layout.shapes);
}

function complex(T, A, start) {
    const time = [];
    const squareWave = [];

   // Recorrer `t` en un rango simétrico alrededor de `start`
    for (let t = start - 100 * T; t < start + 100 * T; t += 0.01) {
    // Ajustar `t` al inicio del periodo en `start`
    const adjustedTime = t - start;
    // Generar la señal cuadrada basándose en el valor ajustado de `t`
    const squareValue = ((adjustedTime % T + T) % T < T / 2) ? A : -A;
    squareWave.push(squareValue);
    time.push(t);
    }
    
    // Graficar la señal cuadrada
    Plotly.newPlot('signal', [{
        x: time,
        y: squareWave,
        mode: 'lines',
        name: 'Señal Cuadrada',
        line: { color: 'green' }
    }], {
        title: 'Señal Cuadrada',
        xaxis: { 
            title: 'Tiempo (s)',
            range: [-5, 5],  // Ajustar el rango para mostrar de -5 a 5
            autorange: false 
        },
        yaxis: { 
            title: 'Amplitud',
            range: [-A -1, A+1], 
            autorange: false 
        },
        dragmode: 'zoom' 
    });

    // Frecuencias y amplitudes
    const frequencies = [];
    const amplitudes = [];
    const f0 = 1 / T; // Frecuencia fundamental

    for (let k = -100; k <= 100; k++) {
        

        // Calcular la frecuencia armónica para k (tanto negativa como positiva)
        frequencies.push(k * f0);

        // Calcular el coeficiente C_k y convertirlo a positivo
        const Ck = (k % 2 !== 0) ? Math.abs((2 * A) / (Math.PI * k)) : 0; // Solo armónicos impares
        amplitudes.push(Ck); // Agregar el valor absoluto de C_k
    }

    // Crear las formas para las líneas
    const shapes = frequencies.map((freq, index) => ({
        type: 'line',
        x0: freq,
        y0: 0,
        x1: freq,
        y1: amplitudes[index],
        line: {
            color: 'green', // Color de las líneas
            width: 2
        }
    }));

    // Graficar las frecuencias
    Plotly.newPlot('frequencyChart', [{
        x: frequencies,
        y: amplitudes,
        mode: 'markers',
        marker: { color: 'green' } // Cambiar a marcador en lugar de línea
    }], {
        title: 'Dominio de Frecuencia',
        xaxis: { 
            title: 'Frecuencia (Hz)',
            range: [-5, 5],  // Ajustar el rango de -20 a 20 en X
            autorange: false 
        },
        yaxis: { 
            title: 'Amplitud',
            range: [-0.5, A + 0.25], 
            autorange: false 
        },
        dragmode: 'zoom',
        shapes: shapes // Agregar las líneas al gráfico
    });

    
}

function complexRectangular(T, A, start, p){
    const periods = 20;                // Número de períodos a generar
    const totalTime = T * periods;     // Tiempo total para los 20 períodos

    const time = [];
    const signal = [];
    // Arrays para almacenar frecuencias y amplitudes
    const frequencies = [];
    const amplitudes = [];
    const f0 = 1 / T; 

    // Generación de la señal rectangular considerando el inicio del periodo
    for (let t = start - totalTime / 2; t < start + totalTime / 2; t += 0.01) {
        // Ajustar el tiempo al inicio del período especificado
        const adjustedTime = (t - start) % T;
        const positiveAdjustedTime = (adjustedTime + T) % T; // Asegura que esté en [0, T)

        // Definir el valor de la señal rectangular en cada instante t
        const rectangularValue = (positiveAdjustedTime < p) ? A : 0;

        // Calcular la serie compleja de Fourier para la onda rectangular
        let sum = 0;
        for (let n = 1; n <= 100; n++) {
            const Ck = (2 * A) / (n * Math.PI);             // Coeficiente de la serie compleja
            const omega = (2 * Math.PI * n) / T;            // Frecuencia angular
            sum += Ck * Math.cos(omega * (t - start));      // Componente coseno ajustada por el inicio
        }
        
        time.push(t);
        signal.push(rectangularValue);
    }

    // Graficar la señal utilizando Plotly
    Plotly.newPlot('signal', [{
        x: time,
        y: signal,
        mode: 'lines',
        name: 'Señal Rectangular',
        line: { color: 'blue' }
    }], {
        title: 'Señal Rectangular en el Primer y Segundo Cuadrante',
        xaxis: { title: 'Tiempo (s)', range: [-10, 10] }, // Rango con desplazamiento inicial
        yaxis: { title: 'Amplitud', range: [-0.5, A+1] },
        dragmode: 'zoom'
    });
    // Calcular el componente de frecuencia cero (DC) para k = 0
    const C0 = (2 * A * p) / T; // Valor medio de la señal
    frequencies.push(0);       // Añadir frecuencia en 0
    amplitudes.push(C0);       // Añadir amplitud en DC
    // Generar los coeficientes de Fourier y las frecuencias correspondientes
    for (let k = -100; k <= 100; k++) {
        
        // Calcular la frecuencia armónica para k (tanto negativa como positiva)
        const frequency = k * f0;
        frequencies.push(frequency);

        // Calcular el coeficiente C_k para una onda rectangular usando la fórmula de la serie compleja
        const Ck = (2 * A * p / T) * Math.sin(Math.PI * k * p / T) / (Math.PI * k * p / T); // Función sinc modificada
        amplitudes.push(Ck); // Usar el valor absoluto para la amplitud
    }

    // Configuración de la gráfica usando Plotly
    const layout = {
        title: 'Dominio de la Frecuencia',
        xaxis: { 
            title: 'Frecuencia (Hz)',
            range: [-5, 5],  
            autorange: false 
        },
        yaxis: { 
            title: 'Amplitud',
            range: [-0.3, 1],  // Ajuste de amplitud de la gráfica
            autorange: false 
        },
        dragmode: 'zoom',
        shapes: [] // Para agregar líneas entre los puntos y el eje x
    };

    // Añadir líneas entre los puntos y el eje x
    for (let i = 0; i < frequencies.length; i++) {
        layout.shapes.push({
            type: 'line',
            x0: frequencies[i],
            y0: 0,
            x1: frequencies[i],
            y1: amplitudes[i],
            line: {
                color: 'green',
                width: 2
            }
        });
    }

    // Graficar la señal en el dominio de la frecuencia
    Plotly.newPlot('frequencyChart', [{
        x: frequencies,
        y: amplitudes,
        mode: 'markers',
        name: 'Amplitud en función de Frecuencia',
        line: { color: 'green' }
    }], layout);

}

function transformation(A, p, start){
    const time = [];
    const pulseSignal = [];

    // Recorrer `t` en un rango suficientemente amplio para ver varios periodos del pulso
    for (let t = start - 100 * p; t < start + 100 * p; t += 0.01) {
        // Ajustar `t` al inicio del periodo en `start`
        const adjustedTime = t - start;
        
        // Generar el pulso rectangular: es A en [start, start + T], 0 fuera de ese rango
        const pulseValue = (adjustedTime >= 0 && adjustedTime < p) ? A : 0;
        
        pulseSignal.push(pulseValue);
        time.push(t);
    }

    // Graficar el pulso
    Plotly.newPlot('signal', [{
        x: time,
        y: pulseSignal,
        mode: 'lines',
        name: 'Pulso',
        line: { color: 'blue' }
    }], {
        title: 'Pulso en el Dominio del Tiempo',
        xaxis: { 
            title: 'Tiempo (s)',
            range: [-5, 5],
            autorange: false 
        },
        yaxis: { 
            title: 'Amplitud',
            range: [-0.5, A + 1], 
            autorange: false 
        },
        dragmode: 'zoom'
    });

    const frequencies = [];
    const amplitudeSpectrum = [];

    // Generamos un rango de frecuencias (ajustar según lo necesario)
    const fMin = -10 / p;  // Frecuencia mínima, ajustable
    const fMax = 10 / p;   // Frecuencia máxima, ajustable
    const step = 0.1;      // Resolución del gráfico

    for (let f = fMin; f <= fMax; f += step) {
        // Transformada de Fourier: X(f) = A * T * sinc(f * T)
        // Usamos sinc(f * T) que es la función sinc (función de normalización)
        const sincValue = Math.sin(Math.PI * f * p) / (Math.PI * f * p);  // Función sinc
        const Xf = A * p * sincValue;  // Amplitud de la transformada

        frequencies.push(f);
        amplitudeSpectrum.push(Xf);  // Amplitud puede ser positiva o negativa
    }

    // Graficar el dominio de la frecuencia (transformada de Fourier)
    Plotly.newPlot('frequencyChart', [{
        x: frequencies,
        y: amplitudeSpectrum,
        mode: 'lines',
        name: 'Transformada de Fourier del Pulso',
        line: { color: 'blue' }
    }], {
        title: 'Dominio de Frecuencia (Transformada de Fourier)',
        xaxis: { 
            title: 'Frecuencia (Hz)',
            range: [fMin, fMax],  // Ajuste del rango de frecuencias
            autorange: false 
        },
        yaxis: { 
            title: 'Amplitud',
            autorange: true
        },
        dragmode: 'zoom'
    });
}