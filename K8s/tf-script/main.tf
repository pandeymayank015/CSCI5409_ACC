provider "google" {
  project = "csci5409-kubernetes-assignment"
  region  = "us-central1"
}

resource "google_container_cluster" "cluster" {
  name               = "my-cluster"
  location           = "us-central1"
  initial_node_count = 1

  node_config {
    machine_type = "e2-micro"
    disk_size_gb = 10

    oauth_scopes = [
      "https://www.googleapis.com/auth/compute",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
  }
}
