import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from '../utils/api/auth';
import { useNavigate } from 'react-router-dom';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  
  const navigate = useNavigate();
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast({ msg });
    if (msg === "please login or register to continue.") {
      navigate("/login", { state: { error: msg } });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleApiError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        showToast("please login or register to continue.");
      } else {
        const errorMessage = error.response.data?.message || "Something went wrong";
        showToast(errorMessage);
      }
    } else if (error.request) {
      showToast("No response from server. Please check your internet connection.");
    } else {
      showToast("An unexpected error occurred");
    }
  };

  const fetchSubscriptionData = async (channelId) => {
    if (!channelId) {
      setLoadingSubscription(false);
      return;
    }

    setLoadingSubscription(true);

    try {
      // Fetch subscriber count regardless of user authentication
      const subscribersData = await getUserChannelSubscribers(channelId);
      setSubscribersCount(subscribersData?.totalSubscribers || 0);

      // Only check subscription status if user is logged in
      if (user) {
        const subscribedChannels = await getSubscribedChannels(user._id);
        const isUserCurrentlySubscribed = subscribedChannels.some(
          (channel) => channel._id === channelId || channel === channelId
        );
        setIsSubscribed(isUserCurrentlySubscribed);
      }
    } catch (err) {
      if (err.message && !err.message.includes('404')) {
        handleApiError(err);
      }
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleToggleSubscription = async (channelId) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }

    if (!channelId || !user?._id || loadingSubscription) return;
    
    setLoadingSubscription(true);
    try {
      const response = await toggleSubscription(channelId);
      
      // Update subscription status based on response
      const newSubscriptionStatus = response?.data?.isSubscribed;
      
      setIsSubscribed(newSubscriptionStatus);
      
      // Update subscriber count
      setSubscribersCount(prevCount =>
        newSubscriptionStatus ? prevCount + 1 : Math.max(0, prevCount - 1)
      );
      
      showToast(newSubscriptionStatus ? 'Subscribed successfully!' : 'Unsubscribed successfully!');
      
      // Fetch updated subscription data instead of reloading
      await fetchSubscriptionData(channelId);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const resetSubscriptionState = () => {
    setSubscribersCount(0);
    setIsSubscribed(false);
    setLoadingSubscription(false);
  };

  const value = {
    subscribersCount,
    isSubscribed,
    loadingSubscription,
    toast,
    fetchSubscriptionData,
    handleToggleSubscription,
    resetSubscriptionState
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 