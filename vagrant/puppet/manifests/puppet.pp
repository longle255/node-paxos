class apt_update {
  exec { "aptGetUpdate":
    command => "sudo apt-get update",
    path => ["/bin", "/usr/bin"]
  }
}

class othertools {
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

class { 'nodejs':
  version => 'stable',
}

class { 'ohmyzsh': }

ohmyzsh::install { 'vagrant': }

include apt_update
include othertools
include nodejs
include ohmyzsh

