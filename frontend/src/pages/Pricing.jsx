import React from 'react';
import Navbar from '../components/Navbar';
import './Pricing.css';

const Pricing = () => {
  const plans = [
    {
      id: 'TRIAL',
      name: 'Founding Member Trial',
      price: '0',
      period: '3 Months',
      features: ['Browse all matches', 'Send Interests', 'Email Support', 'Verification Badge'],
      isPopular: false,
      cta: 'Currently Active'
    },
    {
      id: 'BASIC',
      name: 'Basic Connector',
      price: '999',
      period: '1 Month',
      features: ['Unlimited Chat', 'View 5 Profiles/Day', 'Premium Badge', '24/7 Support'],
      isPopular: true,
      cta: 'Upgrade Now'
    },
    {
      id: 'PREMIUM',
      name: 'Silver Premium',
      price: '2499',
      period: '3 Months',
      features: ['Unlock Phone Numbers', 'Priority Search', 'Personal Relationship Manager', 'Direct Calls'],
      isPopular: false,
      cta: 'Choose Premium'
    }
  ];

  const [me, setMe] = React.useState(null);

  React.useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMe(data.profile);
        }
      } catch (err) {
        console.error('Failed to fetch user context:', err);
      }
    };
    fetchMe();
  }, []);

  const handlePayment = async (plan) => {
    if (plan.id === 'TRIAL') return;

    try {
      const token = localStorage.getItem('token');
      // 1. Create Order
      const orderRes = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId: plan.id, amount: plan.price })
      });
      const order = await orderRes.json();

      // 2. Mock Razorpay Payment Success
      alert(`Redirecting to Secure Gateway for ${plan.name}...`);
      
      const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          planType: plan.id
        })
      });
      
      if (verifyRes.ok) {
        alert('Upgrade Successful! Premium features unlocked. Enjoy your premium experience!');
        // Update local profile state
        if (me) setMe({ ...me, isPremium: true });
        window.location.href = '/dashboard';
      } else {
        const errData = await verifyRes.json();
        alert(errData.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="pricing-page">
      <Navbar user={me} />
      
      <div className="pricing-content">
        <header className="pricing-header">
          <h1 className="premium-gradient-text">Choose Your Path to Marriage</h1>
          <p>Invest in your future. Premium plans for serious life partner seekers.</p>
        </header>

        <div className="plans-grid">
          {plans.map(plan => (
            <div key={plan.id} className={`plan-card card ${plan.isPopular ? 'popular' : ''}`}>
              {plan.isPopular && <div className="popular-tag">Best Value</div>}
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span className="currency">₹</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/ {plan.period}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((f, i) => <li key={i}>✓ {f}</li>)}
              </ul>
              <button 
                className={`btn ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handlePayment(plan)}
                disabled={plan.id === 'TRIAL'}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
