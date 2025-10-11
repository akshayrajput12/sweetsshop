import { delhiveryService } from './delhivery.ts';

// Test the Delhivery API integration
async function testDelhiveryAPI() {
  try {
    console.log('Testing Delhivery API integration...');
    
    // Test delivery pricing estimation
    const pricing = await delhiveryService.estimateDeliveryPricing(
      '110001', // Pickup pincode (Delhi)
      '400001', // Delivery pincode (Mumbai)
      1000,     // Order value
      1         // Weight in kg
    );
    
    console.log('Delivery pricing estimation result:', pricing);
    
    // Test order status (with a mock task ID)
    const status = await delhiveryService.getOrderStatus('TEST123');
    console.log('Order status result:', status);
    
    console.log('Delhivery API integration test completed successfully!');
  } catch (error) {
    console.error('Delhivery API integration test failed:', error);
  }
}

// Run the test
testDelhiveryAPI();