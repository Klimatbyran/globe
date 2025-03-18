# Kubernetes Deployment for Klimatkollen Globe

This directory contains Kubernetes manifests for deploying the Klimatkollen Globe application.

## Components

- **namespace.yaml**: Creates the `klimatkollen` namespace
- **deployment.yaml**: Deploys the application with 2 replicas
- **service.yaml**: Creates a ClusterIP service for the application
- **ingress.yaml**: Sets up the ingress with TLS for globe.klimatkollen.se
- **flux-source.yaml**: FluxCD GitRepository configuration
- **flux-kustomization.yaml**: FluxCD Kustomization configuration

## Prerequisites

- Kubernetes cluster with Nginx Ingress Controller
- cert-manager installed and configured with a ClusterIssuer named "letsencrypt-prod"
- Secret named "github-registry" in the klimatkollen namespace for pulling images from GitHub Container Registry
- FluxCD installed in the cluster

## Deployment

The application is automatically deployed via FluxCD, which watches the repository for changes and applies them to the cluster.

### Setting up FluxCD

To bootstrap FluxCD with this repository:

```bash
flux create source git globe \
  --url=https://github.com/klimatbyran/globe \
  --branch=main \
  --interval=1m \
  --namespace=flux-system

flux create kustomization globe \
  --source=GitRepository/globe \
  --path="./k8s" \
  --prune=true \
  --interval=1m \
  --target-namespace=klimatkollen \
  --namespace=flux-system
```

Alternatively, you can apply the included flux configuration files:

```bash
kubectl apply -f flux-source.yaml
kubectl apply -f flux-kustomization.yaml
```

## CI/CD Pipeline

The GitHub Actions workflow builds and pushes the Docker image to GitHub Container Registry when changes are pushed to the main branch. FluxCD then detects the new image and updates the deployment in the cluster.

## TLS Configuration

TLS certificates are automatically provisioned by cert-manager using Let's Encrypt.
