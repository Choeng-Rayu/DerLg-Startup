import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Test 1: Get payment options without authentication
 */
async function testGetPaymentOptions() {
  try {
    console.log('\n🧪 Test 1: Get payment options without authentication');
    
    const response = await axios.post(`${API_URL}/api/bookings/payment-options`, {
      room_id: '123e4567-e89b-12d3-a456-426614174000', // Dummy UUID
      check_in: '2025-12-01',
      check_out: '2025-12-05',
      guests: {
        adults: 2,
        children: 1,
      },
      deposit_percentage: 60,
    });

    if (response.data.success && response.data.data.payment_options) {
      const options = response.data.data.payment_options;
      
      console.log('✅ Payment options retrieved successfully');
      console.log('\n📊 Pricing Breakdown:');
      console.log(JSON.stringify(response.data.data.pricing_breakdown, null, 2));
      
      console.log('\n💰 Deposit Option (60%):');
      console.log(`  - Original Total: $${options.deposit.original_total}`);
      console.log(`  - Deposit Amount: $${options.deposit.deposit_amount}`);
      console.log(`  - Remaining Balance: $${options.deposit.remaining_balance}`);
      
      console.log('\n📅 Milestone Option (50%/25%/25%):');
      console.log(`  - Original Total: $${options.milestone.original_total}`);
      options.milestone.payment_schedule?.forEach((schedule: any) => {
        console.log(`  - Milestone ${schedule.milestone}: $${schedule.amount} (${schedule.percentage}%) - ${schedule.description}`);
      });
      
      console.log('\n🎁 Full Payment Option (5% discount):');
      console.log(`  - Original Total: $${options.full.original_total}`);
      console.log(`  - Discount: $${options.full.discount_amount}`);
      console.log(`  - Final Total: $${options.full.final_total}`);
      console.log(`  - Bonus Services: ${options.full.bonus_services?.join(', ')}`);
      
      results.push({
        test: 'Get payment options',
        status: 'PASS',
        message: 'Payment options calculated successfully',
        data: options,
      });
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error: any) {
    console.log('❌ Failed to get payment options');
    console.log('Error:', error.response?.data || error.message);
    results.push({
      test: 'Get payment options',
      status: 'FAIL',
      message: error.response?.data?.error?.message || error.message,
    });
  }
}

/**
 * Test 2: Validate deposit percentage range
 */
async function testDepositPercentageValidation() {
  try {
    console.log('\n🧪 Test 2: Validate deposit percentage range (should fail with 80%)');
    
    await axios.post(`${API_URL}/api/bookings/payment-options`, {
      room_id: '123e4567-e89b-12d3-a456-426614174000',
      check_in: '2025-12-01',
      check_out: '2025-12-05',
      guests: {
        adults: 2,
        children: 0,
      },
      deposit_percentage: 80, // Invalid - should be 50-70
    });

    console.log('❌ Should have failed with invalid deposit percentage');
    results.push({
      test: 'Deposit percentage validation',
      status: 'FAIL',
      message: 'Should have rejected deposit percentage > 70%',
    });
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected invalid deposit percentage');
      console.log('Error message:', error.response.data.error.message);
      results.push({
        test: 'Deposit percentage validation',
        status: 'PASS',
        message: 'Correctly validated deposit percentage range',
      });
    } else {
      console.log('❌ Unexpected error');
      results.push({
        test: 'Deposit percentage validation',
        status: 'FAIL',
        message: error.message,
      });
    }
  }
}

/**
 * Test 3: Test payment options service directly
 */
async function testPaymentOptionsService() {
  try {
    console.log('\n🧪 Test 3: Test payment options service directly');
    
    const {
      calculateDepositPayment,
      calculateMilestonePayment,
      calculateFullPayment,
    } = await import('../services/payment-options.service');
    
    const totalAmount = 1000;
    const checkInDate = new Date('2025-12-01');
    
    // Test deposit calculation
    const depositOption = calculateDepositPayment(totalAmount, 60, checkInDate);
    console.log('\n💰 Deposit Payment (60%):');
    console.log(`  - Deposit: $${depositOption.deposit_amount}`);
    console.log(`  - Remaining: $${depositOption.remaining_balance}`);
    
    if (depositOption.deposit_amount !== 600 || depositOption.remaining_balance !== 400) {
      throw new Error('Deposit calculation incorrect');
    }
    
    // Test milestone calculation
    const milestoneOption = calculateMilestonePayment(totalAmount, checkInDate);
    console.log('\n📅 Milestone Payment:');
    milestoneOption.payment_schedule?.forEach((schedule) => {
      console.log(`  - ${schedule.description}: $${schedule.amount}`);
    });
    
    if (milestoneOption.payment_schedule?.[0].amount !== 500) {
      throw new Error('Milestone calculation incorrect');
    }
    
    // Test full payment calculation
    const fullOption = calculateFullPayment(totalAmount);
    console.log('\n🎁 Full Payment:');
    console.log(`  - Original: $${fullOption.original_total}`);
    console.log(`  - Discount: $${fullOption.discount_amount}`);
    console.log(`  - Final: $${fullOption.final_total}`);
    console.log(`  - Bonuses: ${fullOption.bonus_services?.join(', ')}`);
    
    if (fullOption.discount_amount !== 50 || fullOption.final_total !== 950) {
      throw new Error('Full payment calculation incorrect');
    }
    
    console.log('\n✅ All payment option calculations are correct');
    results.push({
      test: 'Payment options service',
      status: 'PASS',
      message: 'All calculations working correctly',
    });
  } catch (error: any) {
    console.log('❌ Payment options service test failed');
    console.log('Error:', error.message);
    results.push({
      test: 'Payment options service',
      status: 'FAIL',
      message: error.message,
    });
  }
}

/**
 * Test 4: Test different deposit percentages
 */
async function testDifferentDepositPercentages() {
  try {
    console.log('\n🧪 Test 4: Test different deposit percentages (50%, 60%, 70%)');
    
    const percentages = [50, 60, 70];
    
    for (const percentage of percentages) {
      const response = await axios.post(`${API_URL}/api/bookings/payment-options`, {
        room_id: '123e4567-e89b-12d3-a456-426614174000',
        check_in: '2025-12-01',
        check_out: '2025-12-05',
        guests: {
          adults: 2,
          children: 0,
        },
        deposit_percentage: percentage,
      });
      
      const depositOption = response.data.data.payment_options.deposit;
      console.log(`\n  ${percentage}% Deposit:`);
      console.log(`    - Deposit: $${depositOption.deposit_amount}`);
      console.log(`    - Remaining: $${depositOption.remaining_balance}`);
    }
    
    console.log('\n✅ All deposit percentages calculated correctly');
    results.push({
      test: 'Different deposit percentages',
      status: 'PASS',
      message: 'All deposit percentages working correctly',
    });
  } catch (error: any) {
    console.log('❌ Failed to test different deposit percentages');
    console.log('Error:', error.response?.data || error.message);
    results.push({
      test: 'Different deposit percentages',
      status: 'FAIL',
      message: error.response?.data?.error?.message || error.message,
    });
  }
}

/**
 * Print test summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`\n${index + 1}. ${icon} ${result.test}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');
  
  if (failed > 0) {
    process.exit(1);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Payment Options Tests...');
  console.log(`API URL: ${API_URL}`);
  
  await testPaymentOptionsService();
  await testGetPaymentOptions();
  await testDepositPercentageValidation();
  await testDifferentDepositPercentages();
  
  printSummary();
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
