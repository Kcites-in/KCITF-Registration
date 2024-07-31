document.getElementById('class').addEventListener('change', function() {
  const classValue = this.value;
  const sectionSelect = document.getElementById('section');
  const day1EventSelect = document.getElementById('day1Event');
  const day2EventSelect = document.getElementById('day2Event');

  // Reset options
  day1EventSelect.innerHTML = '<option value="">Select Day 1 Event (Optional)</option>';
  day2EventSelect.innerHTML = '<option value="">Select Day 2 Event (Optional)</option>';
  sectionSelect.innerHTML = '<option value="">Select Section</option>';
  if (classValue === '11th' || classValue === '12th') {
    ['A', 'B', 'C', 'D'].forEach(section => {
      const option = document.createElement('option');
      option.value = section;
      option.textContent = section;
      sectionSelect.appendChild(option);
    });
  } else {
    ['A', 'B', 'C', 'D', 'E'].forEach(section => {
      const option = document.createElement('option');
      option.value = section;
      option.textContent = section;
      sectionSelect.appendChild(option);
    });
  }
  
  // Populate events based on class for Day 1 and Day 2 separately
  const eventOptionsDay1 = {
      '4th': ['Digital Art'],
      '5th': ['Digital Art'],
      '6th': ['Enchant\'e Cards'],
      '7th': ['Enchant\'e Cards'],
      '8th': ['Enchant\'e Cards'],
      '9th': ['Brainnomics (IT Quiz)', 'Elite Showdown (BGMI)', ],
      '10th': [ 'Brainnomics (IT Quiz)', 'Elite Showdown (BGMI)'],
      '11th': ['Brainnomics (IT Quiz)', 'Elite Showdown (BGMI)'],
      '12th': ['Brainnomics (IT Quiz)', 'Elite Showdown (BGMI)']
  };

  const eventOptionsDay2 = {
      '4th': ['Keystrike Clash'],
      '5th': ['Keystrike Clash'],
      '6th': ['Scratch Symphony'],
      '7th': ['Scratch Symphony','Celestial Cinematics',"Smaqq Quiz"],
      '8th': ['Scratch Symphony','Celestial Cinematics',"Smaqq Quiz"],
      '9th': ['Elite Showdown (Valorant)','Celestial Cinematics',"Smaqq Quiz"],
      '10th': ['Elite Showdown (Valorant)','Celestial Cinematics',"Smaqq Quiz"],
      '11th': ['Elite Showdown (Valorant)'],
      '12th': ['Elite Showdown (Valorant)']
  };

  if (eventOptionsDay1[classValue]) {
      eventOptionsDay1[classValue].forEach(event => {
          const option = document.createElement('option');
          option.value = event + ' (Day 1)';
          option.textContent = event + ' (Day 1)';
          day1EventSelect.appendChild(option);
      });
  }

  if (eventOptionsDay2[classValue]) {
      eventOptionsDay2[classValue].forEach(event => {
          const option = document.createElement('option');
          option.value = event + ' (Day 2)';
          option.textContent = event + ' (Day 2)';
          day2EventSelect.appendChild(option);
      });
  }
});


document.getElementById('registrationForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Form validation
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const classValue = document.getElementById('class').value;
  const section = document.getElementById('section').value;
  const day1Event = document.getElementById('day1Event').value;
  const day2Event = document.getElementById('day2Event').value;

  if (!name || !phone || !email  || !classValue || !section ) {
      alert('Please fill out all required fields.');
      return;
  }

  // Continue with form submission
  const formData = {
      name: name,
      phone: phone,
      email: email,
      class: classValue,
      section: section,
      eventDay1: day1Event,
      eventDay2: day2Event
  };

  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.id) {
      alert('Registration successful! ');
      document.getElementById('registrationForm').reset();
    } else {
      alert('Registration failed: ' + (data.message || 'Unknown error'));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred during registration. Please try again.');
  });
});