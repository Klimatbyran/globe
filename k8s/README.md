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
- FluxCD installed in the cluster

## Deployment

The application is automatically deployed via FluxCD, which watches the repository for changes and applies them to the cluster. The FluxCD configuration is maintained in a separate repository.

## CI/CD Pipeline

The GitHub Actions workflow builds and pushes the Docker image to GitHub Container Registry when changes are pushed to the main branch. FluxCD then detects the new image and updates the deployment in the cluster.

## TLS Configuration

TLS certificates are automatically provisioned by cert-manager using Let's Encrypt.
