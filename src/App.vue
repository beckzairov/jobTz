<template>
  <div class="page-container">
    <form @submit.prevent="handleSubmit" class="form-container">
      <input type="email" v-model="email" placeholder="Email (Required)" required class="input-field">
      <input type="tel" v-model="phone" v-mask="'##-##-##'" placeholder="Phone (11-11-11)" class="input-field">
      <!-- 
      Replace this button or just add :disabled="loading" 
      inside submit button tag, if you need loading animation 
      and disabled style, also you can not send multiple 
      request at the same time in front end.
      But if you need like it is written in the task just leave it as it is. 
      It's all handled on back-end inside server js.

        <button type="submit" class="submit-button" :disabled="loading">
          Submit
        </button> 
      -->
      <button type="submit" class="submit-button">
        Submit
      </button>
    </form>

    <div class="data-container">
      <div v-if="showNoRecordsMessage">
        <h2>No any records found</h2>
      </div>
      <div v-else-if="showData">
        <h2>Data from JSON:</h2>
        <p>Email: {{ jsonData.email }}</p>
        <p>Phone: {{ jsonData.number }}</p>
      </div>
    </div>
    <div v-if="abortedRequest" class="aborted">
      <h2>Your previous request has been cancelled, please wait for 5 seconds before sending another one</h2>
    </div>
  </div>
</template>

<script>
import "./assets/css/style.css";
import { mask } from 'vue-the-mask';

export default {
  directives: { mask },
  data() {
    return {
      email: '',
      phone: '',
      showData: false,
      jsonData: null,
      loading: false,
      showNoRecordsMessage: false,
      abortedRequest: false
    };
  },
  methods: {
    validatePhoneInput(event) {
      this.phone = event.target.value.replace(/\D/g, '').slice(0, 6);
    },
    async handleSubmit() {
      try {
        this.loading = true;
        const response = await fetch('http://localhost:3000/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, phone: this.phone })
        });

        const data = await response.json();
        if (response.status == 499) {
          this.abortedRequest = true
        } else {
          this.abortedRequest = false
          this.showData = data.exists;
          this.showNoRecordsMessage = !data.exists; // Show "no records" if not found
  
          this.jsonData = data.exists ? data.data : null;
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>