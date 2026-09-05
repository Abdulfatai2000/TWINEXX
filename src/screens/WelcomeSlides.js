import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Target, Users, TrendingUp } from 'lucide-react-native';
import OnboardingSlide from '../components/OnboardingSlide';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Stay focused.',
    description: 'Commit to your goals, whether it is learning a new skill or spiritual growth.',
    icon: Target,
  },
  {
    id: '2',
    title: 'Never do it alone.',
    description: 'Partner up with a mentor or peer to keep you accountable every step of the way.',
    icon: Users,
  },
  {
    id: '3',
    title: 'Grow, together.',
    description: 'Share your progress, verify check-ins, and build consistency that lasts.',
    icon: TrendingUp,
  },
];

const WelcomeSlides = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
    } else {
      navigation.navigate('QuestionScreenA');
    }
  };

  const handleSkip = () => {
    navigation.navigate('QuestionScreenA');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide) => (
          <OnboardingSlide
            key={slide.id}
            title={slide.title}
            description={slide.description}
            icon={slide.icon}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <PrimaryButton 
          title={currentIndex === SLIDES.length - 1 ? "Continue" : "Next"} 
          onPress={handleNext} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollContent: {
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB', // gray-300
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#000000',
    width: 24, // expand active dot for a nice effect
  },
});

export default WelcomeSlides;
