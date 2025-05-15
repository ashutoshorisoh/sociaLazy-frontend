import styled from 'styled-components';
import { colors, spacing, shadows, transitions, borderRadius } from '../../styles/theme';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing.md};
  width: 100%;
  
  @media (max-width: 768px) {
    padding: ${spacing.sm};
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme === 'dark' ? colors.background.dark : colors.background.light};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  box-shadow: ${shadows.md};
  transition: ${transitions.default};
  border: 1px solid ${({ theme }) => theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.lg};
  }
`;

export const Button = styled.button`
  background: ${({ variant = 'primary', theme }) =>
        variant === 'primary' ? colors.primary[theme] :
            variant === 'secondary' ? colors.secondary[theme] :
                variant === 'accent' ? colors.accent[theme] : colors.primary[theme]};
  color: ${({ theme }) => theme === 'dark' ? colors.text.dark : colors.text.light};
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: ${borderRadius.full};
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: ${transitions.default};
  
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const Input = styled.input`
  background: ${({ theme }) => theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  border: 1px solid ${({ theme }) => theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
  border-radius: ${borderRadius.md};
  padding: ${spacing.sm} ${spacing.md};
  color: ${({ theme }) => theme === 'dark' ? colors.text.dark : colors.text.light};
  transition: ${transitions.default};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme === 'dark' ? colors.primary.dark : colors.primary.light};
    box-shadow: 0 0 0 2px ${({ theme }) => theme === 'dark' ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.1)'};
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${spacing.lg};
  width: 100%;
`;

export const Flex = styled.div`
  display: flex;
  align-items: ${({ align = 'center' }) => align};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  gap: ${({ gap = spacing.md }) => gap};
  flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
`;

export const Text = styled.p`
  color: ${({ theme }) => theme === 'dark' ? colors.text.dark : colors.text.light};
  font-size: ${({ size = '1rem' }) => size};
  font-weight: ${({ weight = 'normal' }) => weight};
  margin: 0;
`;

export const Badge = styled.span`
  background: ${({ variant = 'primary', theme }) =>
        variant === 'primary' ? colors.primary[theme] :
            variant === 'secondary' ? colors.secondary[theme] :
                variant === 'accent' ? colors.accent[theme] : colors.primary[theme]};
  color: ${({ theme }) => theme === 'dark' ? colors.text.dark : colors.text.light};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.full};
  font-size: 0.875rem;
  font-weight: 600;
`; 