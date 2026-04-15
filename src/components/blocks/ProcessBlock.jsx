import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';

export default function ProcessBlock({ block }) {
  return (
    <Stepper orientation="vertical" nonLinear>
      {block.steps.map((step, i) => (
        <Step key={i} active>
          <StepLabel>
            <Typography fontWeight={600}>{step.title}</Typography>
          </StepLabel>
          <StepContent>
            <Typography color="text.secondary">{step.content}</Typography>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
