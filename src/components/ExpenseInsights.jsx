import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { format, subMonths } from 'date-fns';

export default function ExpenseInsights({ expenses }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!expenses || expenses.length === 0) {
    return (
      <Box id="insights-section" sx={{ mt: 4, px: { xs: 2, sm: 0 } }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Spending Insights
        </Typography>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            textAlign: 'center'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No expenses recorded yet. Add some expenses to see insights!
          </Typography>
        </Paper>
      </Box>
    );
  }

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  const pieChartData = Object.entries(categoryTotals)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      id: category,
      value,
      label: category,
      color: getColorForCategory(category),
    }));

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return format(date, 'MMM yyyy');
  }).reverse();

  const monthlyTotals = expenses.reduce((acc, expense) => {
    const month = format(new Date(expense.date), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {});

  const barChartData = last6Months.map(month => ({
    month,
    amount: monthlyTotals[month] || 0,
  }));

  const maxAmount = Math.max(...barChartData.map(d => d.amount));
  const yAxisMax = Math.ceil(maxAmount / 1000) * 1000;

  const hasPieData = pieChartData.length > 0;
  const hasBarData = barChartData.some(d => d.amount > 0);

  const chartHeight = isMobile ? 300 : 400;
  const pieChartSize = isMobile ? 100 : (isTablet ? 120 : 140);
  const innerRadius = isMobile ? 70 : (isTablet ? 85 : 100);

  return (
    <Box id="insights-section" sx={{ mt: 4, mb: 6, px: { xs: 2, sm: 0 } }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Spending Insights
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        flexDirection: { xs: 'column', lg: 'row' }
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            flex: 1,
            minWidth: { xs: '100%', lg: 350 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: theme.palette.background.paper,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Category Distribution
          </Typography>
          {hasPieData ? (
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <PieChart
                series={[
                  {
                    data: pieChartData,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    innerRadius: innerRadius,
                    outerRadius: pieChartSize,
                    paddingAngle: 3,
                    cornerRadius: 5,
                    startAngle: -90,
                    endAngle: 270,
                    cx: 150,
                    cy: 150,
                  },
                ]}
                height={chartHeight}
                width={isMobile ? 300 : 350}
                slotProps={{
                  legend: { hidden: true }
                }}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '100%'
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}>
                  ₹{total.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Spent
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No category data available
            </Typography>
          )}
          <Box sx={{ 
            mt: 3,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(auto-fill, minmax(130px, 1fr))',
              sm: 'repeat(auto-fill, minmax(150px, 1fr))'
            },
            gap: 2
          }}>
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <Box
                key={category}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: `${getColorForCategory(category)}15`,
                  border: '1px solid',
                  borderColor: `${getColorForCategory(category)}30`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getColorForCategory(category),
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {category}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  ₹{amount.toFixed(0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((amount / total) * 100).toFixed(1)}% of total
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            flex: 1,
            minWidth: { xs: '100%', lg: 350 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: theme.palette.background.paper,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Monthly Spending Trend
          </Typography>
          {hasBarData ? (
            <Box sx={{ 
              mt: 2,
              width: '100%',
              height: chartHeight,
              overflow: 'hidden'
            }}>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: barChartData.map(d => d.month),
                  tickLabelStyle: {
                    angle: isMobile ? 45 : 0,
                    textAnchor: isMobile ? 'start' : 'middle',
                    fontSize: 12,
                    fill: theme.palette.text.secondary,
                  },
                  borderWidth: 0,
                }]}
                yAxis={[{
                  min: 0,
                  max: yAxisMax,
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: theme.palette.text.secondary,
                  },
                  tickNumber: 5,
                  tickSize: 0,
                }]}
                series={[{
                  data: barChartData.map(d => d.amount),
                  color: theme.palette.primary.main,
                  radius: 4,
                  highlightScope: {
                    highlighted: 'item',
                    faded: 'global'
                  },
                }]}
                height={chartHeight}
                margin={{ 
                  top: 20, 
                  bottom: isMobile ? 50 : 30, 
                  left: 50, 
                  right: 20 
                }}
                sx={{
                  '.MuiBarElement-root': {
                    filter: 'brightness(1)',
                    transition: 'all 0.2s',
                    ':hover': {
                      filter: 'brightness(0.9)',
                      transform: 'translateY(-4px)',
                    },
                  },
                }}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No monthly data available
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

function getColorForCategory(category) {
  const colorMap = {
    Food: '#FF6B6B',
    Transportation: '#4ECDC4',
    Entertainment: '#4A90E2',
    Shopping: '#F7B731',
    Bills: '#A3A1FB',
    Other: '#8E8E93'
  };
  return colorMap[category] || '#9CA3AF';
}