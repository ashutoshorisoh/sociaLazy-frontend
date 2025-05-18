import React, { memo, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TrendingContainer = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 247, 247, 0.8)'};
  backdrop-filter: blur(10px);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  padding: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const QuoteCard = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
    transform: translateX(4px);
  }
`;

const QuoteText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-style: italic;
`;

const QuoteAuthor = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  text-align: right;
`;

const TechTip = styled(QuoteCard)`
  border-left-color: ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const TrendingPosts = memo(() => {
    const quotes = useMemo(() => [
        {
            text: "The best way to predict the future is to implement it yourself.",
            author: "David Heinemeier Hansson"
        }
    ], []);

    const techTips = useMemo(() => [
        {
            text: "Remember to use semantic HTML elements for better accessibility and SEO.",
            author: "Web Development Tip"
        }
    ], []);

    return (
        <TrendingContainer>
            <Title>Developer Wisdom</Title>
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-500">💡 Inspiring Quote</h3>
                {quotes.map((quote, index) => (
                    <QuoteCard
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <QuoteText>"{quote.text}"</QuoteText>
                        <QuoteAuthor>— {quote.author}</QuoteAuthor>
                    </QuoteCard>
                ))}
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3 text-green-500">🚀 Tech Tip</h3>
                {techTips.map((tip, index) => (
                    <TechTip
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index + quotes.length) * 0.1 }}
                    >
                        <QuoteText>"{tip.text}"</QuoteText>
                        <QuoteAuthor>— {tip.author}</QuoteAuthor>
                    </TechTip>
                ))}
            </div>
        </TrendingContainer>
    );
});

export default TrendingPosts; 