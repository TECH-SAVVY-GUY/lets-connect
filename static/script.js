

var port = document.getElementById('port').value;
var socket = io.connect('http://' + window.location.hostname + ':' + port);

socket.on('connect', function () {
    console.log('User Connected!!');
});

socket.on('message', function (messageData) {
    
    var textMessage = messageData.text;
    var fileInfo = messageData.file;

    if (textMessage) {
        $('#chat-room').append(marked.parse(textMessage));
    }

    if (fileInfo) {
        var fileContent = fileInfo.content;
        var fileName = fileInfo.name;
        var fileType = fileInfo.type;

        var downloadLink = document.createElement('a');
        downloadLink.href = 'data:' + fileType + ';base64,' + fileContent;
        downloadLink.download = fileName;
        downloadLink.innerHTML = 'Download File: ' + fileName;
        
        $('#chat-room').append(downloadLink);
    }
});



$('#send').on('click', function () {
    var message = $('#message').val().trim();
    var fileInput = document.getElementById('file-upload');
    var file = fileInput.files[0];

    if (message || file) {
        var messageData = {
            text: message,
            file: null,
        };

        if (file) {
            var reader = new FileReader();
            console.log('Reading file...');
            reader.onload = function (e) {
                var fileContent = e.target.result;
                var fileContentBase64 = arrayBufferToBase64(fileContent);
                messageData.file = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: fileContentBase64,
                };
                console.log('Completed reading file.');

                socket.emit('message', JSON.stringify(messageData));
                console.log('Sent file.');

            };

            // Read the file as an ArrayBuffer to handle all file types
            reader.readAsArrayBuffer(file);
        } else {
            socket.emit('message', JSON.stringify(messageData));
            console.log(messageData);

        }


        $('#message').val('').css('height', 'auto').css('overflow-y', 'hidden');
        fileInput.value = '';
    }
});

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;

    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}


$('#message').on('input', function () {
    var textarea = this;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 75) + 'px';

    if (textarea.scrollHeight > 75) {
        textarea.style.overflowY = 'scroll';
    } else {
        textarea.style.overflowY = 'hidden';
    }
});


$('#message').on('keydown', function (event) {
    if (event.keyCode === 13 && event.ctrlKey) {
        event.preventDefault();
        $('#send').click();
    }
});

socket.on('disconnect', function () {
    console.log('User Disconnected!!');
});
