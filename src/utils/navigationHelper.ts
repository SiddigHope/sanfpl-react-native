import { useNavigation } from '@react-navigation/native';
import { useNavigation as useExpoRouterNavigation } from 'expo-router';
import { Platform } from 'react-native';
const useNav = () => {
  const navigation = useNavigation()
  const expoRouterNavigation = useExpoRouterNavigation()

  const navigate = (name, params = {}) => {
    try {
        if(Platform.OS === 'web'){
            expoRouterNavigation.navigate(name, params)
        }else{
            navigation.navigate(name, params)
        }
   } catch (error) {
    console.log(`Can't navigate to:: , ${name} \n ${error}`);
   }
  }

  return { navigate }
}

export default useNav
