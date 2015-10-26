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

# class { 'ohmyzsh': }

# ohmyzsh::install { 'vagrant': }

# class updateZsh {
#   file { '/home/vagrant/.zshrc':
#     ensure => present,
#   }->
#   file_line { 'Append a line to /home/vagrant/.zshrc':
#     path => '/home/vagrant/.zshrc',
#     line => ' # set env var for node
# NODEJS_HOME=/usr/local/node/node-default

# if [ -d "$NODEJS_HOME/bin" ] ; then
#   export PATH="$NODEJS_HOME/bin:$PATH"
# fi',
#   }
# }
include apt_update
include othertools
include ohmyzsh
include nodejs
include updateZsh

