/**
 * Vercel Deployment Service
 * Deploys user websites to Vercel with custom subdomains
 */

interface VercelDeploymentParams {
    projectName: string;
    htmlContent: string;
    userId: string;
}

interface VercelDeploymentResult {
    success: boolean;
    url?: string;
    domain?: string;
    error?: string;
}

const VERCEL_API_BASE = 'https://api.vercel.com';

export class VercelDeployService {
    private apiToken: string;
    private teamId?: string;

    constructor(apiToken: string, teamId?: string) {
        this.apiToken = apiToken;
        this.teamId = teamId;
    }

    /**
     * Deploy HTML content to Vercel
     */
    async deploy(params: VercelDeploymentParams): Promise<VercelDeploymentResult> {
        try {
            const { projectName, htmlContent, userId } = params;

            // Sanitize project name for Vercel
            const sanitizedName = this.sanitizeProjectName(projectName);

            // Create deployment
            const deployment = await this.createDeployment({
                name: sanitizedName,
                files: [
                    {
                        file: 'index.html',
                        data: htmlContent
                    },
                    {
                        file: 'vercel.json',
                        data: JSON.stringify({
                            version: 2,
                            builds: [{ src: '**', use: '@vercel/static' }]
                        })
                    }
                ],
                projectSettings: {
                    framework: null,
                    buildCommand: null,
                    outputDirectory: null
                }
            });

            if (!deployment.url) {
                throw new Error('Deployment failed: No URL returned');
            }

            return {
                success: true,
                url: `https://${deployment.url}`,
                domain: deployment.url
            };
        } catch (error: any) {
            console.error('Vercel deployment error:', error);
            return {
                success: false,
                error: error.message || 'Deployment failed'
            };
        }
    }

    /**
     * Create deployment via Vercel API
     */
    private async createDeployment(config: any) {
        const url = this.teamId
            ? `${VERCEL_API_BASE}/v13/deployments?teamId=${this.teamId}`
            : `${VERCEL_API_BASE}/v13/deployments`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Vercel API error: ${error.message || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Sanitize project name for Vercel requirements
     */
    private sanitizeProjectName(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 63); // Vercel max length
    }

    /**
     * Get deployment status
     */
    async getDeploymentStatus(deploymentId: string) {
        const url = this.teamId
            ? `${VERCEL_API_BASE}/v13/deployments/${deploymentId}?teamId=${this.teamId}`
            : `${VERCEL_API_BASE}/v13/deployments/${deploymentId}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.apiToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get deployment status: ${response.statusText}`);
        }

        return await response.json();
    }
}

/**
 * Create Vercel deployment service instance
 */
export function createVercelDeployService(apiToken: string, teamId?: string) {
    return new VercelDeployService(apiToken, teamId);
}
