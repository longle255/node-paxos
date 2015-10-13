class apt_update {
  exec { "aptGetUpdate":
    command => "sudo apt-get update",
    path => ["/bin", "/usr/bin"]
  }
}

class othertools {
  package { "git":
    ensure => latest,
    require => Exec["aptGetUpdate"]
  }

  package { "vim-common":
    ensure => latest,
    require => Exec["aptGetUpdate"]
  }

  package { "curl":
    ensure => present,
    require => Exec["aptGetUpdate"]
  }

  package { "htop":
    ensure => present,
    require => Exec["aptGetUpdate"]
  }

  package { "g++":
    ensure => present,
    require => Exec["aptGetUpdate"]
  }
}

class { '::nodejs':
  manage_package_repo       => false,
  nodejs_dev_package_ensure => 'present',
  npm_package_ensure        => 'present',
}

include apt_update
include othertools
include nodejs
