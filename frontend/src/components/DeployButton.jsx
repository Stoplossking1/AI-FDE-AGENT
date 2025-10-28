import { useState } from 'react';
import { Rocket, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { deployMVP } from '../utils/api';

export default function DeployButton({ mvpId, onDeployStart, onDeployComplete, disabled }) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState(null);

  const handleDeploy = async () => {
    setIsDeploying(true);
    onDeployStart();

    try {
      const result = await deployMVP(mvpId);
      setDeploymentUrl(result.deploymentUrl);
      onDeployComplete(result);
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  if (deploymentUrl) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open(deploymentUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Deployment
        </Button>
        <CheckCircle2 className="h-5 w-5 text-blue-600" />
      </div>
    );
  }

  return (
    <Button
      onClick={handleDeploy}
      disabled={disabled || isDeploying}
      className="w-full"
      size="lg"
    >
      {isDeploying ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deploying...
        </>
      ) : (
        <>
          <Rocket className="mr-2 h-4 w-4" />
          Deploy to Production
        </>
      )}
    </Button>
  );
}

