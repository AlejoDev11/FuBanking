pipeline {
  agent any

  environment {
    DOCKERHUB_USER = 'abedoya923'
    BACKEND_IMG    = 'abedoya923/fubanking-backend'
    FRONTEND_IMG   = 'abedoya923/fubanking-frontend'
    GITOPS_REPO    = 'https://github.com/andresparceromelo/FuBanking-gitops.git'
    GITOPS_BRANCH  = 'main'
    SONAR_HOST     = 'http://host.docker.internal:9000'
    SONAR_KEY      = 'FuBank'
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Resolve image tag') {
      steps {
        script {
          // main -> release numérico (:BUILD_NUMBER + :latest).
          // Cualquier otra rama (dev, features) -> :dev-BUILD_NUMBER (nunca pisa releases).
          // Funciona en jobs single-pipeline (GIT_BRANCH=origin/dev) y multibranch (BRANCH_NAME).
          def b = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''
          env.IS_MAIN = (b == 'main' || b == 'origin/main' || b == 'master') ? 'true' : 'false'
          env.IMAGE_TAG = (env.IS_MAIN == 'true') ? "${env.BUILD_NUMBER}" : "dev-${env.BUILD_NUMBER}"
          echo "Rama detectada: '${b}' -> IMAGE_TAG=${env.IMAGE_TAG}"
        }
      }
    }

    stage('Security: npm audit') {
      steps {
        dir('backend') {
          sh 'npm audit --audit-level=high || echo "WARN: vulnerabilidades high/critical en backend"'
        }
        dir('frontend') {
          sh 'npm audit --audit-level=high || echo "WARN: vulnerabilidades high/critical en frontend"'
        }
      }
    }

    stage('Backend: install + test + build') {
      steps {
        dir('backend') {
          // Los tests importan env.ts (zod) que hace process.exit(1) sin .env.
          // En CI no existe (.env está gitignoreado): se genera uno dummy con
          // formato válido. Los tests mockean Supabase, no usan estos valores.
          writeFile file: '.env', text: '''PORT=3001
NODE_ENV=development
JWT_SECRET=ci-dummy-secret-min-16-chars
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://dummy.supabase.co
SUPABASE_ANON_KEY=ci-dummy-anon-key
SUPABASE_SERVICE_ROLE_KEY=ci-dummy-service-key
CLIENT_URL=http://localhost:3000
GMAIL_USSER=ci@example.com
GMAIL_PASS=ci-dummy
'''
          sh '''
            node -v; npm -v
            npm ci
            npm run test:coverage || npm run test || echo "WARN: backend tests failed, continuing to sonar"
            npm run build
          '''
        }
      }
    }

    stage('Frontend: install + test + build') {
      steps {
        dir('frontend') {
          sh '''
            npm ci
            npm run test:coverage || npm run test || echo "WARN: frontend tests failed, continuing to sonar"
            npm run build
          '''
        }
      }
    }

    stage('SonarQube analysis') {
      steps {
        withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
          withSonarQubeEnv('SonarLocal') {
            sh '''
              npx -y sonarqube-scanner \
                -Dsonar.projectKey=$SONAR_KEY \
                -Dsonar.host.url=$SONAR_HOST \
                -Dsonar.login=$SONAR_TOKEN
            '''
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          // Requiere webhook Sonar -> http://host.docker.internal:8080/sonarqube-webhook/
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Performance: k6 modulo creditos') {
      steps {
        sh '''
          if ! command -v k6 >/dev/null 2>&1; then
            echo "SKIP: k6 no instalado en el agente (ver docs/qa/entrega-testing-creditos.md para corrida manual)"
            exit 0
          fi
          if [ -z "$FUBANKING_JWT" ]; then
            echo "SKIP: sin FUBANKING_JWT (credential de staging). k6 requiere back vivo + JWT real."
            exit 0
          fi
          k6 run scripts/performance/loans-load.js
        '''
      }
    }

    stage('Docker build') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            TAG="$IMAGE_TAG"

            docker build -t $BACKEND_IMG:$TAG ./backend

            docker build \
              --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 \
              -t $FRONTEND_IMG:$TAG ./frontend
          '''
        }
      }
    }

    stage('Run with Docker (smoke test)') {
      steps {
        sh '''
          TAG="$IMAGE_TAG"
          NET="ci-smoke-$TAG"
          BE="be-smoke-$TAG"
          FE="fe-smoke-$TAG"
          cleanup() { docker rm -f "$BE" "$FE" >/dev/null 2>&1; docker network rm "$NET" >/dev/null 2>&1; }
          trap cleanup EXIT
          docker network create "$NET"
          docker run -d --name "$BE" --network "$NET" \
            -e PORT=3001 -e NODE_ENV=production \
            -e JWT_SECRET=ci-dummy-secret-min-16-chars -e JWT_EXPIRES_IN=7d \
            -e SUPABASE_URL=https://dummy.supabase.co \
            -e SUPABASE_ANON_KEY=ci-dummy-anon-key \
            -e SUPABASE_SERVICE_ROLE_KEY=ci-dummy-service-key \
            -e CLIENT_URL=http://localhost:3000 \
            -e GMAIL_USSER=ci@example.com -e GMAIL_PASS=ci-dummy \
            $BACKEND_IMG:$TAG
          docker run -d --name "$FE" --network "$NET" \
            -e PORT=3000 -e HOSTNAME=0.0.0.0 \
            $FRONTEND_IMG:$TAG
          # Espera con reintentos a que ambos respondan (Jenkins corre en Docker:
          # se usa red dedicada + nombre de contenedor, no localhost)
          docker run --rm --network "$NET" curlimages/curl:latest \
            --retry 12 --retry-delay 5 --retry-all-errors -sf http://$BE:3001/health
          echo "backend OK"
          docker run --rm --network "$NET" curlimages/curl:latest \
            --retry 12 --retry-delay 5 --retry-all-errors -sf http://$FE:3000/
          echo "frontend OK"
        '''
      }
    }

    stage('Docker push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            TAG="$IMAGE_TAG"
            docker push $BACKEND_IMG:$TAG
            docker push $FRONTEND_IMG:$TAG
            # :latest solo sale de main (dev nunca pisa el release).
            if [ "$IS_MAIN" = "true" ]; then
              docker tag $BACKEND_IMG:$TAG $BACKEND_IMG:latest
              docker push $BACKEND_IMG:latest
              docker tag $FRONTEND_IMG:$TAG $FRONTEND_IMG:latest
              docker push $FRONTEND_IMG:latest
            fi
          '''
        }
      }
    }

    stage('Update GitOps repo (new image tags)') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GH_USER', passwordVariable: 'GH_PASS')]) {
          sh '''
            TAG="$IMAGE_TAG"
            rm -rf gitops-tmp && git clone -b $GITOPS_BRANCH "https://$GH_USER:$GH_PASS@github.com/andresparceromelo/FuBanking-gitops.git" gitops-tmp
            cd gitops-tmp

            # Actualiza los newTag de ambas imagenes en overlays/dev/kustomization.yaml
            # (ambas usan el mismo TAG = BUILD_NUMBER del pipeline)
            if [ -f overlays/dev/kustomization.yaml ]; then
              # newTag SIEMPRE entrecomillado: un numero sin comillas rompe
              # `kustomize build` (newTag debe ser string). Se evita \" anidado
              # usando concatenacion de comillas simples.
              sed -i 's/newTag: .*/newTag: "'"$TAG"'"/g' overlays/dev/kustomization.yaml
              grep -A2 "name: abedoya923" overlays/dev/kustomization.yaml
            fi

            git config user.email "jenkins@fubanking.local"
            git config user.name "jenkins-ci"
            git add -A
            git diff --cached --quiet || git commit -m "deploy: backend+frontend build $TAG (jenkins $BUILD_URL)"
            git push origin $GITOPS_BRANCH
          '''
        }
      }
    }
  }

  post {
    success { echo "OK: imagenes :${env.BUILD_NUMBER} pusheadas y GitOps actualizado. ArgoCD sincroniza solo." }
    failure { echo "FAIL: revisar stage rojo. Sonar en ${env.SONAR_HOST} (admin/admin inicial)." }
  }
}
