 // Cargar el modelo de TensorFlow.js
 let model;

 async function loadModel() {
     model = await tf.loadGraphModel('https://2021tensorflowjsrealtimemodel2021.s3.us-south.cloud-object-storage.appdomain.cloud/model.json');
     }

 // Función para realizar la clasificación de la imagen
 async function classifyImage(imageTensor) {
     const predictions = model.predict(imageTensor);

     // Obtener el índice de la categoría con mayor probabilidad
     const predictedClass = predictions.argMax(-1).dataSync()[0];

     return predictedClass;
 }

 // Función para procesar la imagen desde el archivo seleccionado
 async function processImageFromFile() {
 const fileInput = document.getElementById('fileInput');
 if (fileInput.files.length > 0) {
     const file = fileInput.files[0];
     const reader = new FileReader();

     reader.onload = async function (event) {
         const image = new Image();
         image.onload = async function () {
            //Muestra la imagen en el index HTML
            const imageContainer = document.getElementById('imageContainer');
            imageContainer.innerHTML = '';
            imageContainer.appendChild(image);
             // Preprocesamiento similar a lo que mencionaste
             const preprocessedTensor = await preprocessImage(image);

             // Realizar la clasificación
             const predictedClass = await classifyImage(preprocessedTensor);

             // Mostrar el resultado en la página
             const resultDiv = document.getElementById('result');
             resultDiv.innerHTML = `Resultado: ${predictedClass === 0 ? 'Detectado como Real' : 'Detectado como DeepFake'}`;
         };
         image.src = event.target.result;
     };

     reader.readAsDataURL(file);
 }
}

// Función para realizar el preprocesamiento de la imagen y realizar la clasificación
async function preprocessImage(image) {
 return new Promise((resolve) => {
     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');

     canvas.width = 224;
     canvas.height = 224;

     // Dibujar la imagen en el canvas con el tamaño deseado (224x224)
     ctx.drawImage(image, 0, 0, 224, 224);

     // Obtener los datos de la imagen en el canvas
     const imageData = ctx.getImageData(0, 0, 224, 224);

     // Convertir los datos de la imagen en un tensor y realizar el preprocesamiento
     const imageTensor = tf.browser.fromPixels(imageData).toFloat().div(255.0);
     const preprocessedTensor = imageTensor.expandDims();
     
     resolve(preprocessedTensor);
 });
}

// Cargar el modelo y asignar funciones a los eventos del formulario
 tf.ready().then(() => {
         loadModel();
         const imageForm = document.getElementById('imageForm');
         imageForm.onsubmit = (event) => {
             event.preventDefault();
             processImageFromFile();
         };
     });