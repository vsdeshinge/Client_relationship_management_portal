document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('connectForm');
    const thankYouContainer = document.getElementById('thankYouContainer');
    const overlayContainer = document.getElementById('overlayContainer');
    const phoneInput = document.getElementById('phone');
    const submitButton = form.querySelector('button[type="submit"]');
    const phoneMessage = document.createElement('div');
    phoneMessage.style.color = 'red';
    phoneInput.parentNode.insertBefore(phoneMessage, phoneInput.nextSibling);
    const syndicateDropdown = document.getElementById('syndicate_name');
    const faceImageInput = document.getElementById('faceImage');
    let faceImageFile = null;

    phoneInput.addEventListener('input', function() {
        const phone = phoneInput.value.trim();
        if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
            phoneMessage.textContent = 'Phone number must be exactly 10 digits.';
            submitButton.disabled = true;
        } else {
            phoneMessage.textContent = '';
            submitButton.disabled = false;
        }
    });

    async function openCameraForImageCapture() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.backgroundColor = '#fff';
        container.style.zIndex = '9999';
        container.style.padding = '20px';
        container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        container.style.maxWidth = '90%';
        container.style.maxHeight = '90%';
        container.style.overflow = 'hidden';

        document.body.appendChild(container);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            const video = document.createElement('video');
            video.style.width = '100%';
            video.style.height = 'auto';
            video.style.display = 'block';
            container.appendChild(video);
            video.srcObject = stream;
            video.play();

            const captureButton = document.createElement('button');
            captureButton.textContent = 'Capture';
            container.appendChild(captureButton);

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            container.appendChild(closeButton);

            captureButton.addEventListener('click', async () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageDataURL = canvas.toDataURL('image/jpeg');
                const blob = await dataURLtoBlob(imageDataURL);

                faceImageFile = blob;
                showImagePreview('faceImageDisplay', blob);

                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(container);
            });

            closeButton.addEventListener('click', () => {
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(container);
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please upload an image instead.');
            document.body.removeChild(container);
        }
    }

    function showImagePreview(elementId, blob) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';

            const fileSize = document.createElement('span');
            fileSize.textContent = `File Size: ${(blob.size / 1024).toFixed(2)} KB`;

            const previewContainer = document.getElementById(elementId);
            previewContainer.innerHTML = '';
            previewContainer.appendChild(img);
            previewContainer.appendChild(fileSize);
        };

        reader.readAsDataURL(blob);
    }

    async function dataURLtoBlob(dataURL) {
        return new Promise((resolve) => {
            const parts = dataURL.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const rawLength = raw.length;
            const uInt8Array = new Uint8Array(rawLength);

            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            resolve(new Blob([uInt8Array], { type: contentType }));
        });
    }

    document.getElementById('captureFace').addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        openCameraForImageCapture();
    });
       // Handle image upload
       document.getElementById('uploadImageButton').addEventListener('click', function() {
        document.getElementById('uploadImage').click(); // Trigger the hidden file input
    });

    document.getElementById('uploadImage').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            faceImageFile = file; // Set faceImageFile to uploaded file
            showImagePreview('faceImageDisplay', file); // Show preview of uploaded file
        }
    });

    setTimeout(() => {
        overlayContainer.classList.add('transition-left');
    }, 1200);


    // fetch syndicate names (dropdown)
      // Fetch syndicate names and populate dropdown
    //   async function fetchSyndicateNames() {
    //     try {
    //         const response = await fetch('/api/syndicate/names', {
    //             method: 'GET'
    //         });

    //         if (response.ok) {
    //             const syndicates = await response.json();
    //             syndicates.forEach(syndicate => {
    //                 const option = document.createElement('option');
    //                 option.value = syndicate.syndicate_name;
    //                 option.textContent = syndicate.syndicate_name;
    //                 syndicateDropdown.appendChild(option);
    //             });
    //         } else {
    //             console.error('Error fetching syndicate names:', await response.text());
    //         }
    //     } catch (error) {
    //         console.error('Error fetching syndicate names:', error);
    //     }
    // }


    // fetchSyndicateNames(); // Call the function to populate dropdown
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        form.style.display = 'none';
        overlayContainer.style.display = 'none';
        thankYouContainer.style.display = 'block';
    
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value.trim());
        formData.append('phone', document.getElementById('phone').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('companyName', document.getElementById('companyName').value.trim());
        formData.append('personToMeet', document.getElementById('personToMeet').value.trim());
        formData.append('domain', document.getElementById('domains').value.trim()); // Append domain
        formData.append('personreferred', document.getElementById('personreferred').value.trim()); 

    
        console.log('Submitting form data:', formData.get('domain'), formData.get('personReferred'));
    
        if (faceImageFile) {
            formData.append('faceImage', faceImageFile);
        }
    
        try {
            const syndicateToken = localStorage.getItem('syndicateToken'); // Get the token from local storage
            const response = await fetch(`/api/syndicateclients/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${syndicateToken}` // Send token in Authorization header
                },
                body: formData
            });
    
            if (response.headers.get('Content-Type')?.includes('application/json')) {
                const result = await response.json();
    
                if (response.ok) {
                    document.getElementById('message').textContent = 'Registration successful! Thank you.';
                    setTimeout(() => {
                        location.href = 'syndicate-dashboard.html';
                    }, 1000);
                } else {
                    document.getElementById('message').textContent = `Error: ${result.error}`;
                }
            } else {
                console.error('Expected JSON response but received:', await response.text());
                document.getElementById('message').textContent = 'Unexpected server response. Please try again later.';
            }
        } catch (error) {
            console.error('Error during registration:', error);
            document.getElementById('message').textContent = 'Error during registration. Please try again later.';
        }
    });
    
    
    
});