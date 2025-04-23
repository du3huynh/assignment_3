<script setup>
import { ref } from 'vue'
let areTipsVisible = ref(false)

const myCustomUrl = ref('https://intake24.com/')

/**
 * Modified the healthTips to make them more easy to tailor for different users of our website.
 * Stage: beginner, intermediate, advanced
 * Type: diet, lifestyle, activity
 */
const healthTips = ref([
  { id: 1, tip: 'Eat a variety of foods', stage: 'beginner', type: 'diet' },
  {
    id: 2,
    tip: 'Base your diet on plenty of foods rich in carbohydrates',
    stage: 'beginner',
    type: 'diet'
  },
  { id: 3, tip: 'Replace saturated with unsaturated fat', stage: 'beginner', type: 'diet' }
])
</script>

<template>
  <button class="btn" @click="areTipsVisible = !areTipsVisible">Toggle Tips</button>
  <div class="tips" v-if="areTipsVisible">
    <h1>Healthy Eating Tips s</h1>
    <!-- Show tips to the user -->
    <ul>
      <li v-for="myTip in healthTips" v-bind:key="myTip.id">{{ myTip.tip }}</li>
    </ul>
    <a :href="myCustomUrl"
      >For more health coaching and monitoring your health intake with a physician, please visit
      Intake24</a
    >
  </div>
</template>

<style scoped>
.btn {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
}
</style>
