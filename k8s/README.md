# Kubernetes Deployment for Klimatkollen Globe

This directory contains Kubernetes manifests for deploying the Klimatkollen Globe application.

## Components

- **namespace.yaml**: Creates the `klimatkollen` namespace
- **deployment.yaml**: Deploys the application with 2 replicas
- **service.yaml**: Creates a ClusterIP service for the application
- **ingress.yaml**: Sets up the ingress with TLS for globe.klimatkollen.se

## Prerequisites

- Kubernetes cluster with Nginx Ingress Controller
- cert-manager installed and configured with a ClusterIssuer named "letsencrypt-prod"
- Secret named "github-registry" in the klimatkollen namespace for pulling images from GitHub Container Registry

## Deployment

The application is automatically deployed via GitHub Actions when changes are pushed to the main branch.

For manual deployment:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## TLS Configuration

TLS certificates are automatically provisioned by cert-manager using Let's Encrypt.
