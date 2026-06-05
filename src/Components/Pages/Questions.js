export const questions = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      topic: "Arrays",
      description: "Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to target.",
      example: "Input: nums = [2,7,11,15], target = 9 \nOutput: [0,1]",
      
      // 🔥 ASLI CHEEZ: Test Cases for Automation
      testCases: [
          {
              // Hum function call ko string ke roop mein bhejenge
              inputCode: "twoSum([2,7,11,15], 9)", 
              inputDisplay: "nums = [2,7,11,15], target = 9",
              expected: "[0,1]" // Ye string match honi chahiye output se
          }
      ]
    },
    {
      id: 2,
      title: "Return Square",
      difficulty: "Easy",
      topic: "Math",
      description: "Write a function 'square' that takes a number n and returns its square.",
      example: "Input: n = 5 \nOutput: 25",
      
      testCases: [
          {
              inputCode: "square(5)",
              inputDisplay: "n = 5",
              expected: "25"
          }
      ]
    }
  ];